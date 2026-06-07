<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'payment_status', 'search', 'date_from', 'date_to', 'per_page']);
        $orders = $this->orderService->getOrders(auth()->id(), $filters);

        return $this->success('Orders retrieved', [
            'orders' => $orders->items(),
            'meta'   => [
                'total'        => $orders->total(),
                'page'         => $orders->currentPage(),
                'per_page'     => $orders->perPage(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $order = $this->orderService->getOrder((int) $id, auth()->id());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        }

        return $this->success('Order retrieved', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->orderService->getOrder((int) $id, auth()->id());
            $order = $this->orderService->cancelOrder($order, $validated['reason'] ?? null);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Order cancelled', [
            'order' => $order,
        ]);
    }

    public function return(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->orderService->getOrder((int) $id, auth()->id());
            $order = $this->orderService->returnOrder($order, $validated['reason'] ?? null);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Return initiated', [
            'order' => $order,
        ]);
    }

    public function track(string $id): JsonResponse
    {
        try {
            $order = $this->orderService->getOrder((int) $id, auth()->id());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        }

        return $this->success('Tracking info retrieved', [
            'order'    => $order,
            'shipment' => $order->shipment,
        ]);
    }
}
