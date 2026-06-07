<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(
        protected CartService $cartService,
        protected CouponService $couponService,
        protected InventoryService $inventoryService,
    ) {}

    public function getSummary(Cart $cart): array
    {
        $this->validateInventory($cart);

        return $this->cartService->getCartSummary($cart);
    }

    public function placeOrder(Cart $cart, int $userId, int $addressId, string $paymentMethod, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($cart, $userId, $addressId, $paymentMethod, $notes) {
            $address = Address::where('id', $addressId)->where('user_id', $userId)->firstOrFail();

            $this->validateCheckout($cart, $userId);

            $cart->loadMissing('activeItems.product', 'activeItems.variant');
            $summary = $this->cartService->getCartSummary($cart);

            $order = Order::create([
                'user_id'         => $userId,
                'order_number'    => Order::generateOrderNumber(),
                'address_snapshot' => $address->toArray(),
                'payment_method'  => $paymentMethod,
                'payment_status'  => Order::PAYMENT_PENDING,
                'order_status'    => Order::STATUS_PENDING,
                'subtotal'        => $summary['subtotal'],
                'discount'        => $summary['discount'],
                'shipping_charge' => $summary['shipping_charge'],
                'tax'             => $summary['tax'],
                'grand_total'     => $summary['grand_total'],
                'coupon_code'     => $cart->coupon_code ?? null,
                'notes'           => $notes,
                'placed_at'       => now(),
            ]);

            foreach ($cart->activeItems as $cartItem) {
                $price = $cartItem->sale_price_snapshot ?? $cartItem->price_snapshot;

                OrderItem::create([
                    'order_id'          => $order->id,
                    'product_id'        => $cartItem->product_id,
                    'variant_id'        => $cartItem->variant_id,
                    'product_snapshot'  => $cartItem->product?->toArray() ?? [],
                    'variant_snapshot'  => $cartItem->variant?->load('color', 'size')->toArray() ?? [],
                    'sku_snapshot'      => $cartItem->sku_snapshot,
                    'price_snapshot'    => $price,
                    'quantity'          => $cartItem->quantity,
                    'subtotal'          => $cartItem->subtotal,
                ]);

                $this->inventoryService->reduceStock(
                    $cartItem->product_id,
                    $cartItem->variant_id,
                    $cartItem->quantity,
                );
            }

            Payment::create([
                'order_id'       => $order->id,
                'payment_method' => $paymentMethod,
                'amount'         => $summary['grand_total'],
                'status'         => 'pending',
            ]);

            Shipment::create([
                'order_id'        => $order->id,
                'shipment_status' => Shipment::STATUS_PENDING,
            ]);

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'from_status' => null,
                'to_status'   => Order::STATUS_PENDING,
                'changed_by'  => 'system',
                'notes'       => 'Order placed successfully.',
            ]);

            if ($cart->coupon_code) {
                $this->couponService->incrementUsage($cart->coupon_code);
            }

            $cart->update(['status' => 'checked_out']);

            return $order->load(['items', 'payment', 'shipment', 'statusHistories']);
        });
    }

    public function validateInventory(Cart $cart): void
    {
        $cart->loadMissing('activeItems.product', 'activeItems.variant');

        foreach ($cart->activeItems as $item) {
            $stock = $item->variant ? $item->variant->stock : $item->product->stock;

            if (!$item->product || ($item->variant_id && !$item->variant)) {
                throw new \RuntimeException("Product '{$item->product_name_snapshot}' is no longer available.");
            }

            if ($stock < $item->quantity) {
                throw new \RuntimeException(
                    "Insufficient stock for '{$item->product_name_snapshot}'. Available: {$stock}, requested: {$item->quantity}."
                );
            }
        }
    }

    public function validateCheckout(Cart $cart, int $userId): void
    {
        if ($cart->user_id && $cart->user_id !== $userId) {
            throw new \RuntimeException('Cart does not belong to this user.');
        }

        $cart->loadMissing('activeItems');

        if ($cart->activeItems->isEmpty()) {
            throw new \RuntimeException('Cart is empty. Add items before checkout.');
        }

        $this->validateInventory($cart);
    }
}
