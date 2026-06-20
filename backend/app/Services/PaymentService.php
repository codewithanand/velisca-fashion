<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        protected OrderService $orderService,
        protected InventoryService $inventoryService,
    ) {}

    public function processPayment(Order $order, string $method, mixed $gatewayResponse = null): Payment
    {
        return DB::transaction(function () use ($order, $method, $gatewayResponse) {
            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'payment_method' => $method,
                    'amount' => $order->grand_total,
                    'status' => Order::PAYMENT_PENDING,
                    'gateway_response' => $gatewayResponse ? (array) $gatewayResponse : null,
                ]
            );

            return $payment;
        });
    }

    public function markAsPaid(Order $order, ?string $transactionId = null): Order
    {
        return DB::transaction(function () use ($order, $transactionId) {
            $order->payment()->update([
                'status' => Order::PAYMENT_PAID,
                'transaction_id' => $transactionId,
                'paid_at' => now(),
            ]);

            $previousStatus = $order->order_status;

            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
            ]);

            if ($order->order_status === Order::STATUS_PENDING) {
                $order->update([
                    'order_status' => Order::STATUS_CONFIRMED,
                    'confirmed_at' => now(),
                ]);

                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'from_status' => $previousStatus,
                    'to_status' => Order::STATUS_CONFIRMED,
                    'changed_by' => 'system',
                    'notes' => 'Payment received. Order confirmed.',
                ]);
            }

            return $order->fresh()->load('payment', 'statusHistories');
        });
    }

    public function markAsFailed(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->payment()->update([
                'status' => Order::PAYMENT_FAILED,
            ]);

            $order->update([
                'payment_status' => Order::PAYMENT_FAILED,
                'order_status' => Order::STATUS_FAILED,
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $order->order_status,
                'to_status' => Order::STATUS_FAILED,
                'changed_by' => 'system',
                'notes' => 'Payment failed.',
            ]);

            return $order->fresh()->load('payment', 'statusHistories');
        });
    }

    public function processRefund(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->payment()->update([
                'status' => Order::PAYMENT_REFUNDED,
            ]);

            $order->update([
                'payment_status' => Order::PAYMENT_REFUNDED,
                'order_status' => Order::STATUS_REFUNDED,
            ]);

            $order->loadMissing('items');
            foreach ($order->items as $item) {
                $this->inventoryService->restoreStock(
                    $item->product_id,
                    $item->variant_id,
                    $item->quantity,
                );
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $order->order_status,
                'to_status' => Order::STATUS_REFUNDED,
                'changed_by' => 'system',
                'notes' => 'Payment refunded.',
            ]);

            return $order->fresh()->load('payment', 'statusHistories');
        });
    }

    public function verifyPaymentSignature(Order $order, array $data): bool
    {
        return true;
    }
}
