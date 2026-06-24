<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Services\CartService;
use App\Services\CouponService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class CartController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CartService $cartService,
        private readonly CouponService $couponService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        return $this->success('Cart retrieved', [
            'cart' => $cart->loadMissing('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'sometimes|integer|min:1',
        ]);

        $cart = $this->getCart($request);

        try {
            $this->cartService->addItem(
                $cart,
                $validated['product_id'],
                $validated['variant_id'] ?? null,
                $validated['quantity'] ?? 1,
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Item added to cart', [
            'cart' => $cart->fresh()->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            $this->cartService->updateItem($validated['id'], $validated['quantity']);
        } catch (\RuntimeException|\InvalidArgumentException $e) {
            return $this->error($e->getMessage());
        }

        $sessionId = $request->header('X-Session-Id');
        $cart = $this->getCart($request);

        return $this->success('Cart updated', [
            'cart' => $cart->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    public function remove(string $id, Request $request): JsonResponse
    {
        try {
            $this->cartService->removeItem((int) $id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Cart item not found');
        }

        $cart = $this->getCart($request);

        return $this->success('Item removed from cart', [
            'cart' => $cart->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $this->cartService->clearCart($cart);

        return $this->success('Cart cleared');
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
        ]);

        $cart = $this->getCart($request);

        try {
            $summary = $this->cartService->applyCoupon($cart, $validated['code']);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Coupon applied', [
            'summary' => $summary,
        ]);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $summary = $this->cartService->removeCoupon($cart);

        return $this->success('Coupon removed', [
            'summary' => $summary,
        ]);
    }

    public function saveForLater(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|exists:cart_items,id',
        ]);

        try {
            $this->cartService->saveForLater($validated['id']);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Cart item not found');
        }

        $cart = $this->getCart($request);

        return $this->success('Item moved to saved for later', [
            'cart' => $cart->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        return $this->success('Cart summary retrieved', [
            'summary' => $this->cartService->getCartSummary($cart),
        ]);
    }

    protected function getCart(Request $request): Cart
    {
        $userId = null;
        $tokenString = $request->bearerToken();
        if ($tokenString) {
            $token = PersonalAccessToken::findToken($tokenString);
            if ($token) {
                $userId = $token->tokenable_id;
            }
        }
        $sessionId = $request->header('X-Session-Id')
            ?? $request->query('session_id')
            ?? $request->input('session_id');

        return $this->cartService->getOrCreateCart($userId, $sessionId);
    }
}
