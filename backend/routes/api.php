<?php

use App\Http\Controllers\API\Admin\ActivityLogController;
use App\Http\Controllers\API\Admin\AnalyticsController;
use App\Http\Controllers\API\Admin\BannerController;
use App\Http\Controllers\API\Admin\BrandController;
use App\Http\Controllers\API\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\API\Admin\CollectionController;
use App\Http\Controllers\API\Admin\ColorController;
use App\Http\Controllers\API\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\NotificationController;
use App\Http\Controllers\API\Admin\AdminOrderController;
use App\Http\Controllers\API\Admin\PermissionController;
use App\Http\Controllers\API\Admin\ProductController as AdminProductController;
use App\Http\Controllers\API\Admin\ReviewController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\SettingsController;
use App\Http\Controllers\API\Admin\SizeController;
use App\Http\Controllers\API\Admin\TagController;
use App\Http\Controllers\API\Admin\UserController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Auth\PasswordController;
use App\Http\Controllers\API\Auth\RefreshTokenController;
use App\Http\Controllers\API\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\API\Public\ProductController as PublicProductController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\CheckoutController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);

    Route::post('/refresh', [RefreshTokenController::class, 'refresh']);

    Route::post('/forgot-password', [PasswordController::class, 'forgot']);

    Route::post('/reset-password', [PasswordController::class, 'reset']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    });
});

/*
|--------------------------------------------------------------------------
| Public Routes (no auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {

    Route::get('/categories', [PublicCategoryController::class, 'index']);
    Route::get('/categories/tree', [PublicCategoryController::class, 'tree']);
    Route::get('/categories/featured', [PublicCategoryController::class, 'featured']);
    Route::get('/categories/{slug}', [PublicCategoryController::class, 'show']);

    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/featured', [PublicProductController::class, 'featured']);
    Route::get('/products/trending', [PublicProductController::class, 'trending']);
    Route::get('/products/new-arrivals', [PublicProductController::class, 'newArrivals']);
    Route::get('/products/best-sellers', [PublicProductController::class, 'bestSellers']);
    Route::get('/products/related/{id}', [PublicProductController::class, 'related']);
    Route::get('/products/search', [PublicProductController::class, 'search']);
    Route::get('/products/{slug}', [PublicProductController::class, 'show']);

});

/*
|--------------------------------------------------------------------------
| Admin Routes (requires sanctum auth + admin/staff role)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role:' . implode(',', [
    \App\Models\User::ROLE_ADMIN,
    \App\Models\User::ROLE_STAFF,
])])->group(function () {

    // Admin auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Products
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    Route::post('/products/bulk-action', [AdminProductController::class, 'bulkAction']);
    Route::post('/products/{id}/duplicate', [AdminProductController::class, 'duplicate']);
    Route::put('/products/{id}/toggle-featured', [AdminProductController::class, 'toggleFeatured']);
    Route::put('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);

    // Categories
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::get('/categories/tree', [AdminCategoryController::class, 'tree']);
    Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // Collections
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/{id}', [CollectionController::class, 'show']);
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::put('/collections/{id}', [CollectionController::class, 'update']);
    Route::delete('/collections/{id}', [CollectionController::class, 'destroy']);

    // Reviews
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::put('/reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::put('/reviews/{id}/reject', [ReviewController::class, 'reject']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/assign-shipment', [AdminOrderController::class, 'assignShipment']);
    Route::post('/orders/{id}/cancel', [AdminOrderController::class, 'cancelOrder']);
    Route::post('/orders/{id}/refund', [AdminOrderController::class, 'processRefund']);
    Route::get('/orders/analytics/all', [AdminOrderController::class, 'analytics']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::put('/users/{id}/toggle-block', [UserController::class, 'toggleBlock']);
    Route::post('/users/{id}/roles', [UserController::class, 'assignRoles']);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/all', [RoleController::class, 'all']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/permissions/grouped', [PermissionController::class, 'grouped']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']);
    Route::post('/permissions/assign-to-role/{roleId}', [PermissionController::class, 'assignToRole']);
    Route::post('/permissions/assign-to-user/{userId}', [PermissionController::class, 'assignToUser']);

    // Coupons
    Route::get('/coupons', [AdminCouponController::class, 'index']);
    Route::post('/coupons', [AdminCouponController::class, 'store']);
    Route::put('/coupons/{id}', [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);
    Route::put('/coupons/{id}/toggle', [AdminCouponController::class, 'toggle']);

    // Banners
    Route::get('/banners', [BannerController::class, 'index']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::put('/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
    Route::put('/banners/{id}/toggle', [BannerController::class, 'toggle']);

    // Analytics
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/revenue', [AnalyticsController::class, 'revenue']);
    Route::get('/analytics/orders', [AnalyticsController::class, 'orders']);
    Route::get('/analytics/users', [AnalyticsController::class, 'users']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Brands
    Route::get('/brands', [BrandController::class, 'index']);
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Colors
    Route::get('/colors', [ColorController::class, 'index']);
    Route::post('/colors', [ColorController::class, 'store']);
    Route::put('/colors/{id}', [ColorController::class, 'update']);
    Route::delete('/colors/{id}', [ColorController::class, 'destroy']);

    // Sizes
    Route::get('/sizes', [SizeController::class, 'index']);
    Route::post('/sizes', [SizeController::class, 'store']);
    Route::put('/sizes/{id}', [SizeController::class, 'update']);
    Route::delete('/sizes/{id}', [SizeController::class, 'destroy']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::delete('/activity-logs/clear', [ActivityLogController::class, 'clear']);

});

/*
|--------------------------------------------------------------------------
| Wishlist Routes (auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('wishlist')->middleware('auth:sanctum')->group(function () {

    Route::get('/', [WishlistController::class, 'index']);
    Route::post('/', [WishlistController::class, 'store']);
    Route::delete('/{id}', [WishlistController::class, 'destroy']);
    Route::post('/move-to-cart', [WishlistController::class, 'moveToCart']);

});

/*
|--------------------------------------------------------------------------
| Cart Routes (auth or guest via session_id)
|--------------------------------------------------------------------------
*/
Route::prefix('cart')->group(function () {

    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'add']);
    Route::put('/update', [CartController::class, 'update']);
    Route::delete('/remove/{id}', [CartController::class, 'remove']);
    Route::post('/clear', [CartController::class, 'clear']);
    Route::post('/apply-coupon', [CartController::class, 'applyCoupon']);
    Route::post('/remove-coupon', [CartController::class, 'removeCoupon']);
    Route::post('/save-for-later', [CartController::class, 'saveForLater']);
    Route::get('/summary', [CartController::class, 'summary']);

});

/*
|--------------------------------------------------------------------------
| Address Routes (auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('addresses')->middleware('auth:sanctum')->group(function () {

    Route::get('/', [AddressController::class, 'index']);
    Route::post('/', [AddressController::class, 'store']);
    Route::put('/{id}', [AddressController::class, 'update']);
    Route::delete('/{id}', [AddressController::class, 'destroy']);
    Route::post('/{id}/default', [AddressController::class, 'setDefault']);

});

/*
|--------------------------------------------------------------------------
| Checkout Routes (auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('checkout')->middleware('auth:sanctum')->group(function () {

    Route::post('/summary', [CheckoutController::class, 'summary']);
    Route::post('/place-order', [CheckoutController::class, 'placeOrder']);

});

/*
|--------------------------------------------------------------------------
| Order Routes (auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('orders')->middleware('auth:sanctum')->group(function () {

    Route::get('/', [OrderController::class, 'index']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/{id}/return', [OrderController::class, 'return']);
    Route::get('/{id}/track', [OrderController::class, 'track']);

});

/*
|--------------------------------------------------------------------------
| Payment Routes (auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('payments')->middleware('auth:sanctum')->group(function () {

    Route::post('/callback', [PaymentController::class, 'callback']);
    Route::post('/verify', [PaymentController::class, 'verify']);

});
