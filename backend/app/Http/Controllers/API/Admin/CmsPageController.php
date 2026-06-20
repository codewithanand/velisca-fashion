<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CmsPageController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $pages = CmsPage::with('creator:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->page_type, fn ($q, $t) => $q->where('page_type', $t))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->success('CMS pages retrieved', $pages);
    }

    public function show($id)
    {
        $page = CmsPage::with('creator:id,name')->find($id);
        if (! $page) {
            return $this->notFound('CMS page not found');
        }

        return $this->success('CMS page retrieved', ['page' => $page]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:cms_pages,slug',
            'page_type' => 'required|string|max:50',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'banner' => 'nullable|string',
            'og_image' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:255',
            'status' => 'required|string|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
        ]);

        $validated['created_by'] = $request->user()->id;

        if ($validated['status'] === 'published' && ! isset($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $page = CmsPage::create($validated);

        return $this->success('CMS page created', ['page' => $page], 201);
    }

    public function update(Request $request, $id)
    {
        $page = CmsPage::find($id);
        if (! $page) {
            return $this->notFound('CMS page not found');
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:cms_pages,slug,'.$id,
            'page_type' => 'sometimes|string|max:50',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'banner' => 'nullable|string',
            'og_image' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:255',
            'status' => 'sometimes|string|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published' && ! $page->published_at) {
            $validated['published_at'] = now();
        }

        $page->update($validated);

        return $this->success('CMS page updated', ['page' => $page->fresh()]);
    }

    public function destroy($id)
    {
        $page = CmsPage::find($id);
        if (! $page) {
            return $this->notFound('CMS page not found');
        }

        $page->delete();

        return $this->success('CMS page deleted');
    }
}
