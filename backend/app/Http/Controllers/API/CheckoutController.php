<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly CartService $cartService,
    ) {}

    public function summary(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        try {
            $summary = $this->checkoutService->getSummary($cart);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Checkout summary retrieved', [
            'cart'    => $cart->load('activeItems.product.primaryImage', 'activeItems.variant.color', 'activeItems.variant.size'),
            'summary' => $summary,
        ]);
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address_id'     => 'required|exists:addresses,id',
            'payment_method' => 'required|string|in:cod,razorpay,stripe,upi,card',
            'notes'          => 'nullable|string|max:1000',
        ]);

        $cart = $this->getCart($request);

        try {
            $order = $this->checkoutService->placeOrder(
                $cart,
                auth()->id(),
                $validated['address_id'],
                $validated['payment_method'],
                $validated['notes'] ?? null,
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Order placed successfully', [
            'order' => $order,
        ], 201);
    }

    protected function getCart(Request $request): Cart
    {
        $userId = auth()->id();
        $sessionId = $request->header('X-Session-Id');

        return $this->cartService->getOrCreateCart($userId ?: null, $sessionId);
    }
}
