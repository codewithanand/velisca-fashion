<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        // TODO: Implement when orders model/table exists
        return $this->success('Orders retrieved', [
            'orders' => [],
            'meta' => [
                'total' => 0,
                'page' => 1,
                'per_page' => 20,
                'last_page' => 1,
            ],
        ]);
    }

    public function show($id)
    {
        return $this->notFound('Order not found');
    }

    public function updateStatus($id, Request $request)
    {
        return $this->notFound('Order not found');
    }
}
