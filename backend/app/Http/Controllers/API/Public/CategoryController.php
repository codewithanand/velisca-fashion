<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function index(Request $request)
    {
        $request->merge(['status' => true]);
        $categories = $this->categoryService->list($request);

        return $this->success('Categories retrieved', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function tree()
    {
        $categories = $this->categoryService->getTree();

        return $this->success('Category tree', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function show($slug)
    {
        try {
            $category = $this->categoryService->getBySlug($slug);

            return $this->success('Category retrieved', [
                'category' => new CategoryResource($category),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Category not found');
        }
    }

    public function featured()
    {
        $categories = Category::withCount('products')
            ->active()->featured()->orderBy('sort_order')->get();

        return $this->success('Featured categories', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }
}
