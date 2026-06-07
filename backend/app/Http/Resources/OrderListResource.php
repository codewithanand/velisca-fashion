<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'order_status' => $this->order_status,
            'grand_total' => (float) $this->grand_total,
            'items_count' => $this->items_count ?? $this->items->count(),
            'placed_at' => $this->placed_at,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn() => [
                'name' => $this->user->name,
            ]),
        ];
    }
}
