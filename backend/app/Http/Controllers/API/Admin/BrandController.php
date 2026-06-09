<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $brands = Brand::withCount('products')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        return $this->success('Brands retrieved', ['brands' => $brands]);
    }

    public function show($id)
    {
        $brand = Brand::withCount('products')->find($id);
        if (!$brand) return $this->notFound('Brand not found');

        return $this->success('Brand retrieved', ['brand' => $brand]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'website' => 'nullable|string|url',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['created_by'] = auth()->id();
        $brand = Brand::create($validated);

        return $this->success('Brand created', ['brand' => $brand->loadCount('products')], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) return $this->notFound('Brand not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:brands,slug,' . $id,
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'website' => 'nullable|string|url',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $brand->update($validated);

        return $this->success('Brand updated', ['brand' => $brand->loadCount('products')]);
    }

    public function destroy($id)
    {
        $brand = Brand::find($id);
        if (!$brand) return $this->notFound('Brand not found');
        $brand->delete();
        return $this->success('Brand deleted');
    }
}
