<?php

namespace App\Services;

use App\Models\WishlistItem;
use Illuminate\Database\Eloquent\Collection;

class WishlistService
{
    public function getItems(int $userId): Collection
    {
        return WishlistItem::with(['product.primaryImage', 'variant.color', 'variant.size'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function add(int $userId, int $productId, ?int $variantId = null): WishlistItem
    {
        $exists = WishlistItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->exists();

        if ($exists) {
            throw new \RuntimeException('Item already exists in wishlist.');
        }

        return WishlistItem::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'variant_id' => $variantId,
        ]);
    }

    public function remove(int $id): void
    {
        $item = WishlistItem::findOrFail($id);
        $item->delete();
    }

    public function moveToCart(int $userId, int $wishlistItemId): void
    {
        $item = WishlistItem::with('product')->findOrFail($wishlistItemId);

        if ($item->user_id !== $userId) {
            throw new \RuntimeException('Unauthorized action.');
        }

        $cartService = app(CartService::class);
        $cart = $cartService->getOrCreateCart($userId);

        $cartService->addItem($cart, $item->product_id, $item->variant_id);

        $item->delete();
    }
}
