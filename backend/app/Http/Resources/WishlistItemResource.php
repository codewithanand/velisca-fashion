<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishlistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'created_at' => $this->created_at,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'price' => (float) $this->product->price,
                'sale_price' => (float) $this->product->sale_price,
                'display_price' => $this->product->display_price,
                'stock' => $this->product->stock,
                'thumbnail' => $this->product->thumbnail,
            ]),
            'variant' => $this->whenLoaded('variant', fn () => [
                'id' => $this->variant->id,
                'sku' => $this->variant->sku,
                'price' => (float) $this->variant->price,
                'stock' => $this->variant->stock,
                'color' => $this->variant->color,
                'size' => $this->variant->size,
            ]),
        ];
    }
}
