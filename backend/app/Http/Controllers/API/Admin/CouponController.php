<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Coupons retrieved', [
            'coupons' => [],
        ]);
    }

    public function store(Request $request)
    {
        return $this->success('Coupon created', [], 201);
    }

    public function update($id, Request $request)
    {
        return $this->notFound('Coupon not found');
    }

    public function destroy($id)
    {
        return $this->notFound('Coupon not found');
    }
}
