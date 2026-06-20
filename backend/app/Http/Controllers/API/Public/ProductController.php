<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ProductService $productService
    ) {}

    public function index(Request $request)
    {
        $products = $this->productService->getPublicList($request);

        return $this->success('Products retrieved', [
            'products' => ProductListResource::collection($products),
            'meta' => [
                'total' => $products->total(),
                'page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'last_page' => $products->lastPage(),
            ],
        ]);
    }

    public function show($slug)
    {
        try {
            $product = $this->productService->getBySlug($slug);

            return $this->success('Product retrieved', [
                'product' => new ProductResource($product),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }
    }

    public function featured()
    {
        $products = Product::with(['category', 'primaryImage'])
            ->published()->inStock()->featured()
            ->orderBy('created_at', 'desc')->limit(12)->get();

        return $this->success('Featured products', [
            'products' => ProductListResource::collection($products),
        ]);
    }

    public function trending()
    {
        $products = Product::with(['category', 'primaryImage'])
            ->published()->inStock()->trending()
            ->orderBy('created_at', 'desc')->limit(12)->get();

        return $this->success('Trending products', [
            'products' => ProductListResource::collection($products),
        ]);
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'primaryImage'])
            ->published()->inStock()->newArrivals()
            ->orderBy('created_at', 'desc')->limit(12)->get();

        return $this->success('New arrivals', [
            'products' => ProductListResource::collection($products),
        ]);
    }

    public function bestSellers()
    {
        $products = Product::with(['category', 'primaryImage'])
            ->published()->inStock()->bestSellers()
            ->orderBy('created_at', 'desc')->limit(12)->get();

        return $this->success('Best sellers', [
            'products' => ProductListResource::collection($products),
        ]);
    }

    public function related($id)
    {
        try {
            $product = Product::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Product not found');
        }

        $related = Product::with(['category', 'primaryImage'])
            ->published()->inStock()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                $q->where('category_id', $product->category_id)
                    ->orWhereHas('tags', fn ($t) => $t->whereIn('tags.id', $product->tags->pluck('id')));
            })
            ->limit(8)->get();

        return $this->success('Related products', [
            'products' => ProductListResource::collection($related),
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        if (! $query) {
            return $this->error('Search query is required');
        }

        $products = Product::with(['category', 'primaryImage'])
            ->published()->inStock()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%")
                    ->orWhere('short_description', 'like', "%{$query}%")
                    ->orWhereHas('tags', fn ($t) => $t->where('name', 'like', "%{$query}%"));
            })
            ->limit(20)->get();

        return $this->success('Search results', [
            'products' => ProductListResource::collection($products),
            'total' => $products->count(),
        ]);
    }
}
