<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'order_number', 'address_snapshot',
        'payment_method', 'payment_status', 'order_status',
        'subtotal', 'discount', 'shipping_charge', 'tax', 'grand_total',
        'coupon_code', 'notes', 'placed_at',
        'confirmed_at', 'processing_at', 'packed_at',
        'shipped_at', 'delivered_at', 'cancelled_at', 'returned_at',
    ];

    protected $casts = [
        'address_snapshot' => 'array',
        'subtotal' => 'float',
        'discount' => 'float',
        'shipping_charge' => 'float',
        'tax' => 'float',
        'grand_total' => 'float',
        'placed_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'processing_at' => 'datetime',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_PACKED = 'packed';
    public const STATUS_SHIPPED = 'shipped';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_RETURNED = 'returned';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_FAILED = 'failed';

    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_FAILED = 'failed';
    public const PAYMENT_REFUNDED = 'refunded';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function isPending(): bool { return $this->order_status === self::STATUS_PENDING; }
    public function isConfirmed(): bool { return $this->order_status === self::STATUS_CONFIRMED; }
    public function isProcessing(): bool { return $this->order_status === self::STATUS_PROCESSING; }
    public function isShipped(): bool { return $this->order_status === self::STATUS_SHIPPED; }
    public function isDelivered(): bool { return $this->order_status === self::STATUS_DELIVERED; }
    public function isCancelled(): bool { return $this->order_status === self::STATUS_CANCELLED; }
    public function isPaid(): bool { return $this->payment_status === self::PAYMENT_PAID; }
    public function isRefunded(): bool { return $this->payment_status === self::PAYMENT_REFUNDED; }

    public function canCancel(): bool
    {
        return in_array($this->order_status, [self::STATUS_PENDING, self::STATUS_CONFIRMED, self::STATUS_PROCESSING]);
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'VEL';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -6));
        return "{$prefix}-{$date}-{$random}";
    }
}
