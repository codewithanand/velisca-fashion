<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'minimum_amount', 'maximum_discount',
        'usage_limit', 'used_count', 'starts_at', 'expires_at', 'status',
    ];

    protected $casts = [
        'value' => 'float',
        'minimum_amount' => 'float',
        'maximum_discount' => 'float',
        'status' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function isValid(): bool
    {
        if (!$this->status) return false;
        if ($this->starts_at && Carbon::parse($this->starts_at)->isFuture()) return false;
        if ($this->expires_at && Carbon::parse($this->expires_at)->isPast()) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function isApplicable(float $subtotal): bool
    {
        if (!$this->isValid()) return false;
        if ($this->minimum_amount && $subtotal < $this->minimum_amount) return false;
        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        return match ($this->type) {
            'flat' => min($this->value, $subtotal),
            'percentage' => min($subtotal * $this->value / 100, $this->maximum_discount ?? PHP_FLOAT_MAX),
            'free_shipping' => 0,
            default => 0,
        };
    }
}
