<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user_id' => $this->user_id,
            'address_snapshot' => $this->address_snapshot,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'order_status' => $this->order_status,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shipping_charge' => (float) $this->shipping_charge,
            'tax' => (float) $this->tax,
            'grand_total' => (float) $this->grand_total,
            'coupon_code' => $this->coupon_code,
            'notes' => $this->notes,
            'placed_at' => $this->placed_at,
            'confirmed_at' => $this->confirmed_at,
            'processing_at' => $this->processing_at,
            'packed_at' => $this->packed_at,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,
            'returned_at' => $this->returned_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'shipment' => new ShipmentResource($this->whenLoaded('shipment')),
            'status_histories' => OrderStatusHistoryResource::collection($this->whenLoaded('status_histories')),
            'created_at' => $this->created_at,
        ];
    }
}
