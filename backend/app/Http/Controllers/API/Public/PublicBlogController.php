<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $blogs = Blog::with('category:id,name')
            ->published()
            ->when($request->category, fn ($q, $c) => $q->whereHas('category', fn ($q) => $q->where('slug', $c)))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->recent()
            ->paginate($request->per_page ?? 12);

        return $this->success('Blogs retrieved', $blogs);
    }

    public function show($slug)
    {
        $blog = Blog::with('category:id,name,slug')
            ->where('slug', $slug)
            ->published()
            ->first();

        if (! $blog) {
            return $this->notFound('Blog not found');
        }

        $related = Blog::with('category:id,name')
            ->published()
            ->where('id', '!=', $blog->id)
            ->where(function ($q) use ($blog) {
                $q->where('category_id', $blog->category_id)
                    ->orWhere('is_featured', true);
            })
            ->recent()
            ->take(3)
            ->get();

        return $this->success('Blog retrieved', [
            'blog' => $blog,
            'related' => $related,
        ]);
    }

    public function categories()
    {
        $categories = BlogCategory::active()->withCount('blogs')->get();

        return $this->success('Blog categories retrieved', ['categories' => $categories]);
    }

    public function featured()
    {
        $blogs = Blog::with('category:id,name')
            ->published()
            ->featured()
            ->recent()
            ->take(6)
            ->get();

        return $this->success('Featured blogs retrieved', ['blogs' => $blogs]);
    }
}
