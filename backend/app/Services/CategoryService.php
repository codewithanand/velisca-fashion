<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryService
{
    public function list(Request $request)
    {
        $query = Category::withCount('products')
            ->with('parent');

        if ($request->boolean('parents_only')) {
            $query->whereNull('parent_id');
        }

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        return $query->orderBy('sort_order')->orderBy('name')->get();
    }

    public function getTree()
    {
        return Category::withCount('products')
            ->with(['children' => fn($q) => $q->withCount('products')->orderBy('sort_order')->orderBy('name')])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function getById($id)
    {
        return Category::withCount('products')
            ->with(['parent', 'children' => fn($q) => $q->withCount('products')])
            ->findOrFail($id);
    }

    public function getBySlug($slug)
    {
        return Category::withCount('products')
            ->with(['children' => fn($q) => $q->withCount('products')])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function create(array $data): Category
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category->update($data);
        return $category->loadCount('products');
    }

    public function delete(Category $category): void
    {
        Category::where('parent_id', $category->id)->update(['parent_id' => null]);
        $category->delete();
    }
}
