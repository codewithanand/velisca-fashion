<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function callback(Request $request): JsonResponse
    {
        $payload = $request->all();

        // TODO: Implement gateway-specific callback handling
        // Verify webhook signature, update payment status, etc.

        return $this->success('Callback received');
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_id' => 'required|string',
            'signature' => 'nullable|string',
            'razorpay_order_id' => 'nullable|string',
            'razorpay_payment_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string',
        ]);

        // TODO: Implement payment verification logic
        // Verify signature, mark order as paid, etc.

        return $this->success('Payment verified', [
            'verified' => true,
        ]);
    }
}
