<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 50);
        $coupons = Coupon::orderBy('created_at', 'desc')->paginate($perPage);

        return $this->success('Coupons retrieved', [
            'coupons' => $coupons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|in:percentage,flat,free_shipping',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'nullable|boolean',
        ]);

        $coupon = Coupon::create($validated);

        return $this->success('Coupon created', ['coupon' => $coupon], 201);
    }

    public function update($id, Request $request)
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return $this->notFound('Coupon not found');
        }

        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:coupons,code,'.$id,
            'type' => 'sometimes|in:percentage,flat,free_shipping',
            'value' => 'sometimes|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'nullable|boolean',
        ]);

        $coupon->update($validated);

        return $this->success('Coupon updated', ['coupon' => $coupon]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return $this->notFound('Coupon not found');
        }
        $coupon->delete();

        return $this->success('Coupon deleted');
    }

    public function toggle($id)
    {
        $coupon = Coupon::find($id);
        if (! $coupon) {
            return $this->notFound('Coupon not found');
        }
        $coupon->update(['status' => ! $coupon->status]);

        return $this->success('Coupon status toggled', ['coupon' => $coupon]);
    }
}
