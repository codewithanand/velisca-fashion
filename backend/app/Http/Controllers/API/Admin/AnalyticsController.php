<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponseTrait;

    public function dashboard()
    {
        $totalUsers = User::count();
        $totalProducts = Product::count();
        $publishedProducts = Product::where('status', 'published')->count();
        $lowStockProducts = Product::where('stock', '>', 0)->whereColumn('stock', '<=', 'low_stock_threshold')->count();

        $categoryStats = Category::withCount('products')
            ->orderByDesc('products_count')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'name' => $c->name,
                'count' => $c->products_count,
            ]);

        $trendingProducts = Product::with('primaryImage')
            ->where('is_trending', true)
            ->where('status', 'published')
            ->limit(5)->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'sales' => 0,
                'revenue' => 0,
            ]);

        return $this->success('Dashboard analytics', [
            'total_users' => $totalUsers,
            'total_products' => $totalProducts,
            'published_products' => $publishedProducts,
            'low_stock_products' => $lowStockProducts,
            'category_stats' => $categoryStats,
            'trending_products' => $trendingProducts,
        ]);
    }

    public function revenue(Request $request)
    {
        return $this->success('Revenue data', ['data' => []]);
    }

    public function orders(Request $request)
    {
        return $this->success('Orders data', ['data' => []]);
    }

    public function users(Request $request)
    {
        return $this->success('Users data', ['data' => []]);
    }
}
