<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
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

        $totalProducts = Product::count();
        $publishedProducts = Product::where('status', 'published')->count();
        $featuredProducts = Product::where('featured', true)->count();
        $lowStockProducts = Product::where('stock', '>', 0)->whereColumn('stock', '<=', 'low_stock_threshold')->count();
        $outOfStockProducts = Product::where('stock', '<=', 0)->count();

        $recentProducts = Product::with('primaryImage')
            ->orderBy('created_at', 'desc')->limit(5)->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'sale_price' => $p->sale_price,
                'thumbnail' => $p->primaryImage?->image,
                'status' => $p->status,
                'stock' => $p->stock,
                'created_at' => $p->created_at,
            ]);

        return $this->success('Dashboard stats retrieved', [
            'total_users' => $totalUsers,
            'total_admins' => $totalAdmins,
            'total_customers' => $totalCustomers,
            'total_products' => $totalProducts,
            'published_products' => $publishedProducts,
            'featured_products' => $featuredProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'recent_products' => $recentProducts,
        ]);
    }
}
