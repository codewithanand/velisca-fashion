<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponseTrait;

    public function dashboard()
    {
        $totalUsers = User::count();

        return $this->success('Dashboard analytics', [
            'total_users' => $totalUsers,
            'total_orders' => 0,
            'total_revenue' => 0,
            'total_products' => 0,
        ]);
    }

    public function revenue(Request $request)
    {
        return $this->success('Revenue data', [
            'data' => [],
        ]);
    }

    public function orders(Request $request)
    {
        return $this->success('Orders data', [
            'data' => [],
        ]);
    }

    public function users(Request $request)
    {
        return $this->success('Users data', [
            'data' => [],
        ]);
    }
}
