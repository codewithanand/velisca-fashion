<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $blogs = Blog::with('category:id,name', 'creator:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->category_id, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->success('Blogs retrieved', $blogs);
    }

    public function show($id)
    {
        $blog = Blog::with('category:id,name', 'creator:id,name')->find($id);
        if (! $blog) {
            return $this->notFound('Blog not found');
        }

        return $this->success('Blog retrieved', ['blog' => $blog]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:blog_categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'author_id' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'status' => 'required|string|in:draft,published',
            'published_at' => 'nullable|date',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        if (! isset($validated['slug']) || empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $validated['created_by'] = $request->user()->id;

        if ($validated['status'] === 'published' && ! isset($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $blog = Blog::create($validated);

        return $this->success('Blog created', ['blog' => $blog], 201);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::find($id);
        if (! $blog) {
            return $this->notFound('Blog not found');
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:blog_categories,id',
            'title' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,'.$id,
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'author_id' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'status' => 'sometimes|string|in:draft,published',
            'published_at' => 'nullable|date',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published' && ! $blog->published_at) {
            $validated['published_at'] = now();
        }

        $blog->update($validated);

        return $this->success('Blog updated', ['blog' => $blog->fresh()]);
    }

    public function destroy($id)
    {
        $blog = Blog::find($id);
        if (! $blog) {
            return $this->notFound('Blog not found');
        }
        $blog->delete();

        return $this->success('Blog deleted');
    }
}
