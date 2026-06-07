<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'sale_price' => (float) $this->sale_price,
            'cost_price' => (float) $this->cost_price,
            'display_price' => $this->display_price,
            'has_sale' => $this->has_sale,
            'discount_percent' => $this->discount_percent,
            'stock' => $this->stock,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_low_stock' => $this->is_low_stock,
            'is_out_of_stock' => $this->is_out_of_stock,
            'thumbnail' => $this->thumbnail,
            'weight' => (float) $this->weight,
            'unit' => $this->unit,
            'status' => $this->status,
            'featured' => $this->featured,
            'is_new' => $this->is_new,
            'is_trending' => $this->is_trending,
            'is_best_seller' => $this->is_best_seller,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'seo_keywords' => $this->seo_keywords,
            'og_image' => $this->og_image,
            'published_at' => $this->published_at,
            'average_rating' => $this->average_rating,
            'reviews_count' => $this->reviews_count,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => $this->whenLoaded('brand'),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'primary_image' => new ProductImageResource($this->whenLoaded('primaryImage')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'tags' => $this->whenLoaded('tags'),
            'reviews' => ReviewResource::collection($this->whenLoaded('approvedReviews')),
            'created_by' => $this->whenLoaded('createdBy'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
