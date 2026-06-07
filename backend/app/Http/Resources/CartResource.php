<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('activeItems')),
            'subtotal' => (float) $this->subtotal,
            'items_count' => $this->items_count,
            'coupon_code' => $this->coupon_code,
            'created_at' => $this->created_at,
        ];
    }
}
