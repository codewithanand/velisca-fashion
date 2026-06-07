<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'sale_price' => (float) $this->sale_price,
            'display_price' => $this->display_price,
            'has_sale' => $this->has_sale,
            'discount_percent' => $this->discount_percent,
            'stock' => $this->stock,
            'is_low_stock' => $this->is_low_stock,
            'is_out_of_stock' => $this->is_out_of_stock,
            'thumbnail' => $this->thumbnail,
            'status' => $this->status,
            'featured' => $this->featured,
            'is_new' => $this->is_new,
            'is_trending' => $this->is_trending,
            'is_best_seller' => $this->is_best_seller,
            'average_rating' => $this->average_rating,
            'reviews_count' => $this->reviews_count,
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'primary_image' => $this->whenLoaded('primaryImage', fn() => [
                'id' => $this->primaryImage->id,
                'image' => $this->primaryImage->image,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
