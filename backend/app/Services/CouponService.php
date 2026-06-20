<?php

namespace App\Services;

use App\Models\Coupon;

class CouponService
{
    public function getCouponByCode(string $code): ?Coupon
    {
        return Coupon::where('code', $code)
            ->where('status', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->first();
    }

    public function validateCoupon(string $code, float $subtotal): array
    {
        $coupon = $this->getCouponByCode($code);

        if (! $coupon) {
            throw new \RuntimeException('Invalid or expired coupon code.');
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            throw new \RuntimeException('Coupon usage limit has been exhausted.');
        }

        if ($coupon->minimum_amount && $subtotal < $coupon->minimum_amount) {
            throw new \RuntimeException("Minimum order amount of {$coupon->minimum_amount} is required for this coupon.");
        }

        return [
            'coupon' => $coupon,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
        ];
    }

    public function applyDiscount(string $code, float $subtotal): array
    {
        $validated = $this->validateCoupon($code, $subtotal);
        $coupon = $validated['coupon'];
        $discount = 0;

        $discount = match ($coupon->type) {
            'flat' => min((float) $coupon->value, $subtotal),
            'percentage' => min(
                $coupon->maximum_discount
                    ? min($subtotal * ((float) $coupon->value / 100), (float) $coupon->maximum_discount)
                    : $subtotal * ((float) $coupon->value / 100),
                $subtotal
            ),
            'free_shipping' => 0,
            default => 0,
        };

        return [
            'coupon' => $coupon,
            'discount' => round($discount, 2),
            'type' => $coupon->type,
        ];
    }

    public function incrementUsage(string $code): void
    {
        Coupon::where('code', $code)->increment('used_count');
    }
}
