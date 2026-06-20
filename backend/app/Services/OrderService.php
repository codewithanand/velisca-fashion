<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected array $statusFlow = [
        Order::STATUS_PENDING,
        Order::STATUS_CONFIRMED,
        Order::STATUS_PROCESSING,
        Order::STATUS_PACKED,
        Order::STATUS_SHIPPED,
        Order::STATUS_DELIVERED,
    ];

    public function __construct(
        protected InventoryService $inventoryService,
    ) {}

    public function getOrders(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['items', 'payment', 'shipment'])
            ->where('user_id', $userId);

        if (! empty($filters['status'])) {
            $query->where('order_status', $filters['status']);
        }

        if (! empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('order_number', 'like', "%{$filters['search']}%");
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('placed_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('placed_at', '<=', $filters['date_to']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    public function getOrder(int $id, ?int $userId = null): Order
    {
        $query = Order::with([
            'items', 'payment', 'shipment', 'statusHistories', 'user',
        ]);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->findOrFail($id);
    }

    public function cancelOrder(Order $order, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $reason) {
            if (! $order->canCancel()) {
                throw new \RuntimeException('Order cannot be cancelled in its current state.');
            }

            $previousStatus = $order->order_status;

            $order->update([
                'order_status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
            ]);

            $this->restoreStock($order);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $previousStatus,
                'to_status' => Order::STATUS_CANCELLED,
                'changed_by' => 'system',
                'notes' => $reason ?? 'Order cancelled by customer.',
            ]);

            return $order->fresh()->load('statusHistories');
        });
    }

    public function returnOrder(Order $order, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $reason) {
            if ($order->order_status !== Order::STATUS_DELIVERED) {
                throw new \RuntimeException('Only delivered orders can be returned.');
            }

            if ($order->isRefunded()) {
                throw new \RuntimeException('Order has already been refunded.');
            }

            $previousStatus = $order->order_status;

            $order->update([
                'order_status' => Order::STATUS_RETURNED,
                'returned_at' => now(),
            ]);

            $this->restoreStock($order);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $previousStatus,
                'to_status' => Order::STATUS_RETURNED,
                'changed_by' => 'system',
                'notes' => $reason ?? 'Return initiated by customer.',
            ]);

            return $order->fresh()->load('statusHistories');
        });
    }

    public function updateStatus(Order $order, string $status, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($order, $status, $notes) {
            $this->validateStatusTransition($order, $status);

            $previousStatus = $order->order_status;
            $timestamps = [
                Order::STATUS_CONFIRMED => 'confirmed_at',
                Order::STATUS_PROCESSING => 'processing_at',
                Order::STATUS_PACKED => 'packed_at',
                Order::STATUS_SHIPPED => 'shipped_at',
                Order::STATUS_DELIVERED => 'delivered_at',
            ];

            $updateData = ['order_status' => $status];

            if (isset($timestamps[$status])) {
                $updateData[$timestamps[$status]] = now();
            }

            if ($status === Order::STATUS_CANCELLED) {
                $updateData['cancelled_at'] = now();
                $this->restoreStock($order);
            }

            $order->update($updateData);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $previousStatus,
                'to_status' => $status,
                'changed_by' => 'admin',
                'notes' => $notes ?? "Status updated from {$previousStatus} to {$status}.",
            ]);

            return $order->fresh()->load('statusHistories');
        });
    }

    public function restoreStock(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $this->inventoryService->restoreStock(
                $item->product_id,
                $item->variant_id,
                $item->quantity,
            );
        }
    }

    protected function validateStatusTransition(Order $order, string $newStatus): void
    {
        if ($order->order_status === Order::STATUS_DELIVERED) {
            throw new \RuntimeException('Delivered orders cannot be modified.');
        }

        if ($order->order_status === Order::STATUS_CANCELLED) {
            throw new \RuntimeException('Cancelled orders cannot be modified.');
        }

        if ($order->order_status === Order::STATUS_RETURNED) {
            throw new \RuntimeException('Returned orders cannot be modified.');
        }

        if ($newStatus === Order::STATUS_CANCELLED && ! $order->canCancel()) {
            throw new \RuntimeException('Order cannot be cancelled in its current state.');
        }

        if (in_array($newStatus, $this->statusFlow) && in_array($order->order_status, $this->statusFlow)) {
            $currentIndex = array_search($order->order_status, $this->statusFlow);
            $newIndex = array_search($newStatus, $this->statusFlow);

            if ($newIndex <= $currentIndex && $newStatus !== Order::STATUS_CANCELLED) {
                throw new \RuntimeException("Invalid status transition from {$order->order_status} to {$newStatus}.");
            }
        }
    }
}
