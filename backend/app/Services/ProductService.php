<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    public function list(Request $request)
    {
        $query = Product::with([
            'category', 'primaryImage', 'brand',
            'variants' => fn ($q) => $q->with('color', 'size'),
        ]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($category = $request->get('category_id')) {
            $query->where('category_id', $category);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        if ($stock = $request->get('stock_status')) {
            match ($stock) {
                'in_stock' => $query->inStock(),
                'low_stock' => $query->lowStock(),
                'out_of_stock' => $query->outOfStock(),
                default => null,
            };
        }

        if ($minPrice = $request->get('min_price')) {
            $query->where(function ($q) use ($minPrice) {
                $q->where('price', '>=', $minPrice)
                    ->orWhere('sale_price', '>=', $minPrice);
            });
        }

        if ($maxPrice = $request->get('max_price')) {
            $query->where(function ($q) use ($maxPrice) {
                $q->where('price', '<=', $maxPrice)
                    ->orWhere('sale_price', '<=', $maxPrice);
            });
        }

        if ($tag = $request->get('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('name', $tag));
        }

        $sortField = match ($request->get('sort')) {
            'price-asc' => 'price',
            'price-desc' => 'price',
            'name-asc' => 'name',
            'name-desc' => 'name',
            'oldest' => 'created_at',
            default => 'created_at',
        };
        $sortDir = in_array($request->get('sort'), ['price-desc', 'name-desc']) ? 'desc' : 'desc';

        $products = $query->orderBy($sortField, $sortDir)
            ->paginate($request->get('per_page', 20));

        return [
            'products' => $products,
            'meta' => [
                'total' => $products->total(),
                'page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'last_page' => $products->lastPage(),
            ],
        ];
    }

    public function getById($id)
    {
        return Product::with([
            'category', 'brand', 'images', 'variants.color', 'variants.size',
            'tags', 'approvedReviews.user', 'approvedReviews.images',
            'createdBy',
        ])->findOrFail($id);
    }

    public function getBySlug($slug)
    {
        return Product::with([
            'category', 'brand', 'images', 'variants.color', 'variants.size',
            'tags', 'approvedReviews.user', 'approvedReviews.images',
        ])->where('slug', $slug)->published()->firstOrFail();
    }

    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
            $data['published_at'] = $data['status'] === 'published' ? now() : null;

            $product = Product::create($data);

            if (! empty($data['images'])) {
                $this->syncImages($product, $data['images']);
            }

            if (! empty($data['variants'])) {
                $this->syncVariants($product, $data['variants']);
            }

            if (! empty($data['tags'])) {
                $product->tags()->sync($data['tags']);
            }

            return $product->load([
                'category', 'brand', 'images', 'variants.color', 'variants.size', 'tags',
            ]);
        });
    }

    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            if (isset($data['name']) && ! isset($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            if (isset($data['status']) && $data['status'] === 'published' && ! $product->published_at) {
                $data['published_at'] = now();
            }

            $product->update($data);

            if (isset($data['images'])) {
                $this->syncImages($product, $data['images']);
            }

            if (isset($data['variants'])) {
                $this->syncVariants($product, $data['variants']);
            }

            if (isset($data['tags'])) {
                $product->tags()->sync($data['tags']);
            }

            return $product->load([
                'category', 'brand', 'images', 'variants.color', 'variants.size', 'tags',
            ]);
        });
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function duplicate(Product $product): Product
    {
        return DB::transaction(function () use ($product) {
            $copy = $product->replicate();
            $copy->name = $product->name.' (Copy)';
            $copy->slug = $product->slug.'-copy-'.uniqid();
            $copy->sku = $product->sku ? $product->sku.'-COPY' : null;
            $copy->status = 'draft';
            $copy->save();

            foreach ($product->images as $image) {
                $copy->images()->create($image->toArray());
            }

            foreach ($product->variants as $variant) {
                $copy->variants()->create($variant->toArray());
            }

            $copy->tags()->sync($product->tags->pluck('id'));

            return $copy->load(['images', 'variants', 'tags']);
        });
    }

    public function toggleFeatured(Product $product): Product
    {
        $product->update(['featured' => ! $product->featured]);

        return $product;
    }

    public function toggleStatus(Product $product): Product
    {
        $newStatus = match ($product->status) {
            'published' => 'draft',
            'draft' => 'published',
            default => 'draft',
        };
        $product->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'published' ? now() : $product->published_at,
        ]);

        return $product;
    }

    public function bulkAction(array $ids, string $action): void
    {
        DB::transaction(function () use ($ids, $action) {
            match ($action) {
                'delete' => Product::whereIn('id', $ids)->delete(),
                'publish' => Product::whereIn('id', $ids)->update(['status' => 'published', 'published_at' => now()]),
                'unpublish' => Product::whereIn('id', $ids)->update(['status' => 'draft']),
                'feature' => Product::whereIn('id', $ids)->update(['featured' => true]),
                'unfeature' => Product::whereIn('id', $ids)->update(['featured' => false]),
                default => null,
            };
        });
    }

    public function getPublicList(Request $request)
    {
        $query = Product::with(['category', 'primaryImage'])
            ->published()->inStock();

        if ($category = $request->get('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('tags', fn ($t) => $t->where('name', 'like', "%{$search}%"));
            });
        }

        if ($minPrice = $request->get('min_price')) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice = $request->get('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        $sortField = match ($request->get('sort')) {
            'price-asc' => 'price',
            'price-desc' => 'price',
            'newest' => 'created_at',
            'popular' => 'created_at',
            default => 'created_at',
        };
        $sortDir = $request->get('sort') === 'price-asc' ? 'asc' : 'desc';

        return $query->orderBy($sortField, $sortDir)->paginate($request->get('per_page', 20));
    }

    private function syncImages(Product $product, array $images): void
    {
        $existingIds = collect($images)->filter(fn ($i) => ! empty($i['id']))->pluck('id');
        $product->images()->whereNotIn('id', $existingIds)->delete();

        foreach ($images as $i => $image) {
            if (! empty($image['id'])) {
                ProductImage::where('id', $image['id'])->update([
                    'image' => $image['image'],
                    'sort_order' => $image['sort_order'] ?? $i,
                    'is_primary' => $image['is_primary'] ?? ($i === 0),
                    'variant' => $image['variant'] ?? null,
                ]);
            } else {
                $product->images()->create([
                    'image' => $image['image'],
                    'sort_order' => $image['sort_order'] ?? $i,
                    'is_primary' => $image['is_primary'] ?? ($i === 0),
                    'variant' => $image['variant'] ?? null,
                ]);
            }
        }
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $existingIds = collect($variants)->filter(fn ($v) => ! empty($v['id']))->pluck('id');
        $product->variants()->whereNotIn('id', $existingIds)->delete();

        foreach ($variants as $variant) {
            if (! empty($variant['id'])) {
                ProductVariant::where('id', $variant['id'])->update($variant);
            } else {
                $product->variants()->create($variant);
            }
        }
    }
}
