<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $categories = BlogCategory::withCount('blogs')->orderBy('name')->get();

        return $this->success('Blog categories retrieved', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        if (! isset($validated['slug']) || empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = BlogCategory::create($validated);

        return $this->success('Blog category created', ['category' => $category], 201);
    }

    public function show($id)
    {
        $category = BlogCategory::withCount('blogs')->find($id);
        if (! $category) {
            return $this->notFound('Blog category not found');
        }

        return $this->success('Blog category retrieved', ['category' => $category]);
    }

    public function update(Request $request, $id)
    {
        $category = BlogCategory::find($id);
        if (! $category) {
            return $this->notFound('Blog category not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,'.$id,
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return $this->success('Blog category updated', ['category' => $category]);
    }

    public function destroy($id)
    {
        $category = BlogCategory::find($id);
        if (! $category) {
            return $this->notFound('Blog category not found');
        }
        if ($category->blogs()->count() > 0) {
            return $this->error('Cannot delete category with associated blogs', 422);
        }
        $category->delete();

        return $this->success('Blog category deleted');
    }
}
