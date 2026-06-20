<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\WishlistService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly WishlistService $wishlistService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->wishlistService->getItems(auth()->id());

        return $this->success('Wishlist items retrieved', [
            'items' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        try {
            $item = $this->wishlistService->add(
                auth()->id(),
                $validated['product_id'],
                $validated['variant_id'] ?? null,
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Item added to wishlist', [
            'item' => $item,
        ], 201);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->wishlistService->remove((int) $id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Wishlist item not found');
        }

        return $this->success('Item removed from wishlist');
    }

    public function moveToCart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wishlist_item_id' => 'required|exists:wishlist_items,id',
        ]);

        try {
            $this->wishlistService->moveToCart(
                auth()->id(),
                $validated['wishlist_item_id'],
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Item moved to cart');
    }
}
