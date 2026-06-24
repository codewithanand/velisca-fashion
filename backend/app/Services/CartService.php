<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function __construct(
        protected CouponService $couponService,
    ) {}

    public function getOrCreateCart(?int $userId = null, ?string $sessionId = null): Cart
    {
        $cart = null;

        if ($userId) {
            $cart = Cart::where('user_id', $userId)
                ->where('status', 'active')
                ->with('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size')
                ->first();
        }

        if (! $cart && $sessionId) {
            $cart = Cart::where('session_id', $sessionId)
                ->where('status', 'active')
                ->with('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size')
                ->first();

            if ($cart && $userId) {
                $cart->update(['user_id' => $userId]);
            }
        }

        if (! $cart) {
            $cart = Cart::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'status' => 'active',
            ]);
        }

        return $cart;
    }

    public function addItem(Cart $cart, int $productId, ?int $variantId = null, int $quantity = 1): CartItem
    {
        return DB::transaction(function () use ($cart, $productId, $variantId, $quantity) {
            $product = Product::findOrFail($productId);
            $variant = $variantId ? ProductVariant::findOrFail($variantId) : null;

            $stock = $variant ? $variant->stock : $product->stock;
            if ($stock < $quantity) {
                throw new \RuntimeException("Insufficient stock. Available: {$stock}");
            }

            $existing = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->where('variant_id', $variantId)
                ->where('save_for_later', false)
                ->first();

            if ($existing) {
                $newQty = $existing->quantity + $quantity;
                $currentStock = $variant ? $variant->stock : $product->stock;
                if ($currentStock < $newQty) {
                    throw new \RuntimeException("Insufficient stock. Available: {$currentStock}");
                }

                $price = $this->resolvePrice($product, $variant);
                $existing->update([
                    'quantity' => $newQty,
                    'subtotal' => $price * $newQty,
                ]);

                return $existing->fresh()->load('product.primaryImage', 'variant.color', 'variant.size');
            }

            $price = $this->resolvePrice($product, $variant);

            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'product_name_snapshot' => $product->name,
                'variant_snapshot' => $variant ? $variant->load('color', 'size')->toArray() : null,
                'sku_snapshot' => $variant ? $variant->sku : $product->sku,
                'price_snapshot' => $product->price,
                'sale_price_snapshot' => $product->sale_price,
                'quantity' => $quantity,
                'subtotal' => $price * $quantity,
                'save_for_later' => false,
            ]);

            return $item->load('product.primaryImage', 'variant.color', 'variant.size');
        });
    }

    public function updateItem(int $cartItemId, int $quantity): CartItem
    {
        return DB::transaction(function () use ($cartItemId, $quantity) {
            $item = CartItem::with('product', 'variant')->findOrFail($cartItemId);

            if ($quantity < 1) {
                throw new \InvalidArgumentException('Quantity must be at least 1.');
            }

            $stock = $item->variant ? $item->variant->stock : $item->product->stock;
            if ($stock < $quantity) {
                throw new \RuntimeException("Insufficient stock. Available: {$stock}");
            }

            $price = $item->sale_price_snapshot ?? $item->price_snapshot;
            $item->update([
                'quantity' => $quantity,
                'subtotal' => $price * $quantity,
            ]);

            return $item->fresh()->load('product.primaryImage', 'variant.color', 'variant.size');
        });
    }

    public function removeItem(int $cartItemId): void
    {
        $item = CartItem::findOrFail($cartItemId);
        $item->delete();
    }

    public function clearCart(Cart $cart): void
    {
        CartItem::where('cart_id', $cart->id)->delete();
    }

    public function getCartSummary(Cart $cart): array
    {
        $cart->loadMissing('activeItems');
        $subtotal = $cart->subtotal;
        $discount = 0;

        if ($couponCode = $cart->coupon_code ?? null) {
            try {
                $result = $this->couponService->applyDiscount($couponCode, $subtotal);
                $discount = $result['discount'];
            } catch (\Exception) {
                $discount = 0;
            }
        }

        $shippingCharge = $subtotal >= 500 ? 0 : 49;
        $tax = round($subtotal * 0.05, 2);
        $grandTotal = max(0, $subtotal - $discount + $shippingCharge + $tax);

        return [
            'subtotal' => (float) $subtotal,
            'discount' => (float) $discount,
            'shipping_charge' => (float) $shippingCharge,
            'tax' => (float) $tax,
            'grand_total' => (float) $grandTotal,
            'items_count' => $cart->itemsCount,
        ];
    }

    public function applyCoupon(Cart $cart, string $code): array
    {
        $summary = $this->getCartSummary($cart);

        $this->couponService->validateCoupon($code, $summary['subtotal']);

        $result = $this->couponService->applyDiscount($code, $summary['subtotal']);

        $cart->coupon_code = $code;
        $cart->discount = $result['discount'];
        $cart->save();

        return $this->getCartSummary($cart);
    }

    public function removeCoupon(Cart $cart): array
    {
        unset($cart->coupon_code);
        unset($cart->discount);

        return $this->getCartSummary($cart);
    }

    public function saveForLater(int $cartItemId): CartItem
    {
        $item = CartItem::findOrFail($cartItemId);
        $item->update([
            'save_for_later' => ! $item->save_for_later,
        ]);

        return $item->fresh()->load('product.primaryImage', 'variant.color', 'variant.size');
    }

    public function mergeGuestCart(string $sessionId, int $userId): Cart
    {
        return DB::transaction(function () use ($sessionId, $userId) {
            $guestCart = Cart::where('session_id', $sessionId)
                ->where('status', 'active')
                ->whereNull('user_id')
                ->first();

            if (! $guestCart || $guestCart->items()->count() === 0) {
                return $this->getOrCreateCart($userId);
            }

            $userCart = Cart::where('user_id', $userId)
                ->where('status', 'active')
                ->first();

            if (! $userCart) {
                $guestCart->update(['user_id' => $userId]);

                return $guestCart->fresh()->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size');
            }

            foreach ($guestCart->activeItems as $guestItem) {
                $existing = CartItem::where('cart_id', $userCart->id)
                    ->where('product_id', $guestItem->product_id)
                    ->where('variant_id', $guestItem->variant_id)
                    ->where('save_for_later', false)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'quantity' => $existing->quantity + $guestItem->quantity,
                        'subtotal' => $existing->subtotal + $guestItem->subtotal,
                    ]);
                } else {
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'product_id' => $guestItem->product_id,
                        'variant_id' => $guestItem->variant_id,
                        'product_name_snapshot' => $guestItem->product_name_snapshot,
                        'variant_snapshot' => $guestItem->variant_snapshot,
                        'sku_snapshot' => $guestItem->sku_snapshot,
                        'price_snapshot' => $guestItem->price_snapshot,
                        'sale_price_snapshot' => $guestItem->sale_price_snapshot,
                        'quantity' => $guestItem->quantity,
                        'subtotal' => $guestItem->subtotal,
                        'save_for_later' => false,
                    ]);
                }
            }

            $guestCart->items()->delete();
            $guestCart->update(['status' => 'abandoned']);

            return $userCart->fresh()->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size');
        });
    }

    public function syncCartItems(Cart $cart): void
    {
        $items = CartItem::with('product', 'variant')
            ->where('cart_id', $cart->id)
            ->get();

        foreach ($items as $item) {
            $product = $item->product;
            $variant = $item->variant;

            if (! $product || ($item->variant_id && ! $variant)) {
                $item->delete();

                continue;
            }

            $price = $this->resolvePrice($product, $variant);

            $item->update([
                'product_name_snapshot' => $product->name,
                'variant_snapshot' => $variant?->load('color', 'size')->toArray(),
                'sku_snapshot' => $variant?->sku ?? $product->sku,
                'price_snapshot' => $product->price,
                'sale_price_snapshot' => $product->sale_price,
                'subtotal' => $price * $item->quantity,
            ]);
        }
    }

    protected function resolvePrice(Product $product, ?ProductVariant $variant): float
    {
        if ($variant && $variant->sale_price) {
            return (float) $variant->sale_price;
        }
        if ($variant) {
            return (float) ($variant->price ?? 0);
        }
        if ($product->sale_price) {
            return (float) $product->sale_price;
        }

        return (float) ($product->price ?? 0);
    }
}
