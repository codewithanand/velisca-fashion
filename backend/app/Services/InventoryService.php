<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function validateStock(int $productId, ?int $variantId, int $quantity): bool
    {
        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);

            return $variant->stock >= $quantity;
        }

        $product = Product::findOrFail($productId);

        return $product->stock >= $quantity;
    }

    public function reduceStock(int $productId, ?int $variantId, int $quantity): void
    {
        DB::transaction(function () use ($productId, $variantId, $quantity) {
            if ($variantId) {
                ProductVariant::where('id', $variantId)
                    ->where('stock', '>=', $quantity)
                    ->decrement('stock', $quantity);
            }

            Product::where('id', $productId)
                ->where('stock', '>=', $quantity)
                ->decrement('stock', $quantity);
        });
    }

    public function restoreStock(int $productId, ?int $variantId, int $quantity): void
    {
        DB::transaction(function () use ($productId, $variantId, $quantity) {
            if ($variantId) {
                ProductVariant::where('id', $variantId)->increment('stock', $quantity);
            }

            Product::where('id', $productId)->increment('stock', $quantity);
        });
    }

    public function getStockLevel(int $productId, ?int $variantId = null): int
    {
        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);

            return (int) $variant->stock;
        }

        $product = Product::findOrFail($productId);

        return (int) $product->stock;
    }

    public function isLowStock(int $productId, ?int $variantId = null): bool
    {
        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);
            $threshold = $variant->product->low_stock_threshold ?? 5;

            return $variant->stock > 0 && $variant->stock <= $threshold;
        }

        $product = Product::findOrFail($productId);
        $threshold = $product->low_stock_threshold ?? 5;

        return $product->stock > 0 && $product->stock <= $threshold;
    }
}
