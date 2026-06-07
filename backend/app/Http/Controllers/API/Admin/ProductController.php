<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ProductService $productService
    ) {}

    public function index(Request $request)
    {
        $result = $this->productService->list($request);

        return $this->success('Products retrieved', [
            'products' => ProductListResource::collection($result['products']),
            'meta' => $result['meta'],
        ]);
    }

    public function show($id)
    {
        try {
            $product = $this->productService->getById($id);
            return $this->success('Product retrieved', [
                'product' => new ProductResource($product),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:20',
            'status' => 'nullable|string|in:draft,published,archived',
            'featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_trending' => 'nullable|boolean',
            'is_best_seller' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*.image' => 'required_with:images|string',
            'images.*.is_primary' => 'nullable|boolean',
            'images.*.sort_order' => 'nullable|integer',
            'images.*.variant' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.sale_price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.weight' => 'nullable|numeric|min:0',
            'variants.*.image' => 'nullable|string',
            'variants.*.status' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $validated['created_by'] = auth()->id();
        $product = $this->productService->create($validated);

        return $this->success('Product created', [
            'product' => new ProductResource($product),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:products,slug,' . $id,
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $id,
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:20',
            'status' => 'nullable|string|in:draft,published,archived',
            'featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_trending' => 'nullable|boolean',
            'is_best_seller' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*.id' => 'nullable|exists:product_images,id',
            'images.*.image' => 'required_with:images|string',
            'images.*.is_primary' => 'nullable|boolean',
            'images.*.sort_order' => 'nullable|integer',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.sku' => 'nullable|string',
            'variants.*.color_id' => 'nullable|exists:colors,id',
            'variants.*.size_id' => 'nullable|exists:sizes,id',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.sale_price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.status' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $product = $this->productService->update($product, $validated);

        return $this->success('Product updated', [
            'product' => new ProductResource($product),
        ]);
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $this->productService->delete($product);

        return $this->success('Product deleted');
    }

    public function duplicate($id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $copy = $this->productService->duplicate($product);

        return $this->success('Product duplicated', [
            'product' => new ProductResource($copy),
        ], 201);
    }

    public function toggleFeatured($id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $product = $this->productService->toggleFeatured($product);

        return $this->success('Product featured status toggled', [
            'product' => new ProductListResource($product),
        ]);
    }

    public function toggleStatus($id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $product = $this->productService->toggleStatus($product);

        return $this->success('Product status toggled', [
            'product' => new ProductListResource($product),
        ]);
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
            'action' => 'required|string|in:delete,publish,unpublish,feature,unfeature',
        ]);

        $this->productService->bulkAction($validated['ids'], $validated['action']);

        return $this->success('Bulk action completed');
    }
}
