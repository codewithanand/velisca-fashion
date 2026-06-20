<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CouponService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CouponService $couponService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $coupons = Coupon::orderBy('id', 'desc')->paginate($perPage);

        return $this->success('Coupons retrieved', [
            'coupons' => $coupons->items(),
            'meta' => [
                'total' => $coupons->total(),
                'page' => $coupons->currentPage(),
                'per_page' => $coupons->perPage(),
                'last_page' => $coupons->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|string|in:flat,percentage,free_shipping',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'status' => 'sometimes|boolean',
        ]);

        $coupon = Coupon::create($validated);

        return $this->success('Coupon created', [
            'coupon' => $coupon,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Coupon not found');
        }

        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:coupons,code,'.$id,
            'type' => 'sometimes|string|in:flat,percentage,free_shipping',
            'value' => 'sometimes|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'status' => 'sometimes|boolean',
        ]);

        $coupon->update($validated);

        return $this->success('Coupon updated', [
            'coupon' => $coupon->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Coupon not found');
        }

        $coupon->delete();

        return $this->success('Coupon deleted');
    }

    public function toggle(string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Coupon not found');
        }

        $coupon->update(['status' => ! $coupon->status]);

        return $this->success('Coupon status toggled', [
            'coupon' => $coupon->fresh(),
        ]);
    }
}
