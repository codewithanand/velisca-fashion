<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $tags = Tag::withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        return $this->success('Tags retrieved', ['tags' => $tags]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $tag = Tag::create($validated);

        return $this->success('Tag created', ['tag' => $tag], 201);
    }

    public function destroy($id)
    {
        $tag = Tag::find($id);
        if (! $tag) {
            return $this->notFound('Tag not found');
        }
        $tag->delete();

        return $this->success('Tag deleted');
    }
}
