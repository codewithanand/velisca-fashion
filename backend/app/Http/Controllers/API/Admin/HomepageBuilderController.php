<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageLayout;
use App\Models\HomeSection;
use App\Models\SectionItem;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class HomepageBuilderController extends Controller
{
    use ApiResponseTrait;

    public function layout()
    {
        $layout = HomepageLayout::with(['sections' => function ($q) {
            $q->with('items')->orderBy('sort_order');
        }])->where('is_active', true)->first();

        if (! $layout) {
            $layout = HomepageLayout::first();
        }

        return $this->success('Homepage layout retrieved', ['layout' => $layout]);
    }

    public function layouts()
    {
        $layouts = HomepageLayout::withCount('sections')->orderBy('name')->get();

        return $this->success('Layouts retrieved', ['layouts' => $layouts]);
    }

    public function storeLayout(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validated['is_active'] ?? false) {
            HomepageLayout::where('is_active', true)->update(['is_active' => false]);
        }

        $layout = HomepageLayout::create($validated);

        return $this->success('Layout created', ['layout' => $layout], 201);
    }

    public function updateLayout(Request $request, $id)
    {
        $layout = HomepageLayout::find($id);
        if (! $layout) {
            return $this->notFound('Layout not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validated['is_active'] ?? false) {
            HomepageLayout::where('is_active', true)->where('id', '!=', $id)->update(['is_active' => false]);
        }

        $layout->update($validated);

        return $this->success('Layout updated', ['layout' => $layout->fresh()]);
    }

    public function deleteLayout($id)
    {
        $layout = HomepageLayout::find($id);
        if (! $layout) {
            return $this->notFound('Layout not found');
        }
        if ($layout->sections()->count() > 0) {
            return $this->error('Cannot delete layout with existing sections', 422);
        }
        $layout->delete();

        return $this->success('Layout deleted');
    }

    public function sections(Request $request)
    {
        $sections = HomeSection::with('items')
            ->when($request->layout_id, fn ($q, $l) => $q->where('layout_id', $l))
            ->orderBy('sort_order')
            ->get();

        return $this->success('Sections retrieved', ['sections' => $sections]);
    }

    public function storeSection(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'section_type' => 'required|string|max:50',
            'section_key' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
            'layout_id' => 'nullable|exists:homepage_layouts,id',
            'settings_json' => 'nullable|array',
        ]);

        $validated['status'] = $validated['status'] ?? true;
        if (! isset($validated['sort_order'])) {
            $max = HomeSection::max('sort_order');
            $validated['sort_order'] = ($max ?? -1) + 1;
        }

        $section = HomeSection::create($validated);

        return $this->success('Section created', ['section' => $section->load('items')], 201);
    }

    public function updateSection(Request $request, $id)
    {
        $section = HomeSection::find($id);
        if (! $section) {
            return $this->notFound('Section not found');
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'section_type' => 'sometimes|string|max:50',
            'section_key' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
            'layout_id' => 'nullable|exists:homepage_layouts,id',
            'settings_json' => 'nullable|array',
        ]);

        $section->update($validated);

        return $this->success('Section updated', ['section' => $section->fresh()->load('items')]);
    }

    public function deleteSection($id)
    {
        $section = HomeSection::find($id);
        if (! $section) {
            return $this->notFound('Section not found');
        }
        $section->delete();

        return $this->success('Section deleted');
    }

    public function reorderSections(Request $request)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:home_sections,id',
            'sections.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['sections'] as $data) {
            HomeSection::where('id', $data['id'])->update(['sort_order' => $data['sort_order']]);
        }

        return $this->success('Sections reordered');
    }

    public function storeSectionItem(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:home_sections,id',
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer|min:0',
            'settings_json' => 'nullable|array',
        ]);

        $item = SectionItem::create($validated);

        return $this->success('Section item created', ['item' => $item], 201);
    }

    public function updateSectionItem(Request $request, $id)
    {
        $item = SectionItem::find($id);
        if (! $item) {
            return $this->notFound('Section item not found');
        }

        $validated = $request->validate([
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer|min:0',
            'settings_json' => 'nullable|array',
        ]);

        $item->update($validated);

        return $this->success('Section item updated', ['item' => $item]);
    }

    public function deleteSectionItem($id)
    {
        $item = SectionItem::find($id);
        if (! $item) {
            return $this->notFound('Section item not found');
        }
        $item->delete();

        return $this->success('Section item deleted');
    }
}
