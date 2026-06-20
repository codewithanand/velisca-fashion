<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $attributes = Attribute::withCount('values')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Attributes retrieved', ['attributes' => $attributes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:attributes,slug',
            'type' => 'nullable|string|max:50',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'status' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $attribute = Attribute::create($validated);

        return $this->success('Attribute created', ['attribute' => $attribute], 201);
    }

    public function show($id)
    {
        $attribute = Attribute::with('values')->find($id);
        if (! $attribute) {
            return $this->notFound('Attribute not found');
        }

        return $this->success('Attribute retrieved', ['attribute' => $attribute]);
    }

    public function update(Request $request, $id)
    {
        $attribute = Attribute::find($id);
        if (! $attribute) {
            return $this->notFound('Attribute not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:attributes,slug,'.$id,
            'type' => 'nullable|string|max:50',
            'is_filterable' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'status' => 'nullable|boolean',
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $attribute->update($validated);

        return $this->success('Attribute updated', ['attribute' => $attribute]);
    }

    public function destroy($id)
    {
        $attribute = Attribute::find($id);
        if (! $attribute) {
            return $this->notFound('Attribute not found');
        }

        $attribute->values()->delete();
        $attribute->delete();

        return $this->success('Attribute deleted');
    }
}
