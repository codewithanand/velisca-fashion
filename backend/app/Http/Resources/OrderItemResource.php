<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'product_snapshot' => $this->product_snapshot,
            'variant_snapshot' => $this->variant_snapshot,
            'sku_snapshot' => $this->sku_snapshot,
            'price_snapshot' => (float) $this->price_snapshot,
            'quantity' => $this->quantity,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
