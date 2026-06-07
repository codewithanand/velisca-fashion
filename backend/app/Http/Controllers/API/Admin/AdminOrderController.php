<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly OrderService $orderService,
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'payment', 'shipment', 'user']);

        if ($search = $request->input('search')) {
            $query->where('order_number', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('order_status', $status);
        }

        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('placed_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('placed_at', '<=', $dateTo);
        }

        $perPage = $request->input('per_page', 20);
        $orders = $query->orderBy('id', 'desc')->paginate($perPage);

        return $this->success('Orders retrieved', [
            'orders' => $orders->items(),
            'meta'   => [
                'total'     => $orders->total(),
                'page'      => $orders->currentPage(),
                'per_page'  => $orders->perPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $order = Order::with(['items', 'payment', 'shipment', 'statusHistories', 'user'])->findOrFail((int) $id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        }

        return $this->success('Order retrieved', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PROCESSING,
                Order::STATUS_PACKED,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
            ]),
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $order = Order::findOrFail((int) $id);
            $order = $this->orderService->updateStatus($order, $validated['status'], $validated['notes'] ?? null);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Order status updated', [
            'order' => $order,
        ]);
    }

    public function assignShipment(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string|max:255',
            'courier_name'    => 'required|string|max:255',
        ]);

        try {
            $order = Order::findOrFail((int) $id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        }

        $shipment = $order->shipment()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'tracking_number' => $validated['tracking_number'],
                'courier_name'    => $validated['courier_name'],
                'shipment_status' => Shipment::STATUS_SHIPPED,
                'shipped_at'      => now(),
            ]
        );

        if ($order->order_status === Order::STATUS_PACKED || $order->order_status === Order::STATUS_PROCESSING) {
            $this->orderService->updateStatus($order, Order::STATUS_SHIPPED, 'Shipment assigned.');
        }

        return $this->success('Shipment assigned', [
            'shipment' => $shipment->fresh(),
        ]);
    }

    public function cancelOrder(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        try {
            $order = Order::findOrFail((int) $id);
            $order = $this->orderService->cancelOrder($order, $validated['reason'] ?? 'Cancelled by admin.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Order cancelled', [
            'order' => $order,
        ]);
    }

    public function processRefund(string $id): JsonResponse
    {
        try {
            $order = Order::findOrFail((int) $id);
            $order = $this->paymentService->processRefund($order);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Order not found');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        return $this->success('Refund processed', [
            'order' => $order,
        ]);
    }

    public function analytics(): JsonResponse
    {
        $totalOrders = Order::count();
        $revenue = Order::where('payment_status', Order::PAYMENT_PAID)->sum('grand_total');
        $avgOrderValue = $totalOrders > 0 ? round($revenue / $totalOrders, 2) : 0;

        $statusBreakdown = Order::selectRaw('order_status, COUNT(*) as count')
            ->groupBy('order_status')
            ->pluck('count', 'order_status');

        return $this->success('Order analytics retrieved', [
            'analytics' => [
                'total_orders'      => $totalOrders,
                'revenue'           => (float) $revenue,
                'avg_order_value'   => $avgOrderValue,
                'status_breakdown'  => $statusBreakdown,
            ],
        ]);
    }
}
