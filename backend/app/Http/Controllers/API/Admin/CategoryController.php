<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function index(Request $request)
    {
        $categories = $this->categoryService->list($request);
        return $this->success('Categories retrieved', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function tree()
    {
        $categories = $this->categoryService->getTree();
        return $this->success('Category tree retrieved', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function show($id)
    {
        try {
            $category = $this->categoryService->getById($id);
            return $this->success('Category retrieved', [
                'category' => new CategoryResource($category),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Category not found');
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'banner' => 'nullable|string',
            'status' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['created_by'] = auth()->id();
        $category = $this->categoryService->create($validated);

        return $this->success('Category created', [
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Category not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:categories,slug,' . $id,
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'banner' => 'nullable|string',
            'status' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $category = $this->categoryService->update($category, $validated);

        return $this->success('Category updated', [
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Category not found');
        }

        $this->categoryService->delete($category);

        return $this->success('Category deleted');
    }
}
