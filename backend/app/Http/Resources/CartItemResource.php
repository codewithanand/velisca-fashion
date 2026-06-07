<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'product_name_snapshot' => $this->product_name_snapshot,
            'variant_snapshot' => $this->variant_snapshot,
            'sku_snapshot' => $this->sku_snapshot,
            'price_snapshot' => (float) $this->price_snapshot,
            'sale_price_snapshot' => (float) $this->sale_price_snapshot,
            'display_price' => $this->display_price,
            'quantity' => $this->quantity,
            'subtotal' => (float) $this->subtotal,
            'save_for_later' => $this->save_for_later,
            'thumbnail' => $this->whenLoaded('product.primaryImage', fn() => [
                'id' => $this->product->primaryImage->id,
                'image' => $this->product->primaryImage->image,
            ]),
        ];
    }
}
