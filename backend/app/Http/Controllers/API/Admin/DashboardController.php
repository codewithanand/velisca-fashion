<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $totalUsers = User::count();
        $totalAdmins = User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_STAFF])->count();
        $totalCustomers = User::where('role', User::ROLE_CUSTOMER)->count();

        return $this->success('Dashboard stats retrieved', [
            'total_users' => $totalUsers,
            'total_admins' => $totalAdmins,
            'total_customers' => $totalCustomers,
        ]);
    }
}
