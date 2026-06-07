<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'color_id' => $this->color_id,
            'size_id' => $this->size_id,
            'price' => (float) $this->price,
            'sale_price' => (float) $this->sale_price,
            'display_price' => $this->display_price,
            'stock' => $this->stock,
            'weight' => (float) $this->weight,
            'image' => $this->image,
            'status' => $this->status,
            'color' => $this->whenLoaded('color'),
            'size' => $this->whenLoaded('size'),
        ];
    }
}
