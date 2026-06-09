<?php

use App\Http\Controllers\API\Admin\ActivityLogController;
use App\Http\Controllers\API\Admin\AnalyticsController;
use App\Http\Controllers\API\Admin\AttributeController;
use App\Http\Controllers\API\Admin\AttributeValueController;
use App\Http\Controllers\API\Admin\BannerController;
use App\Http\Controllers\API\Admin\BrandController;
use App\Http\Controllers\API\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\API\Admin\CollectionController;
use App\Http\Controllers\API\Admin\ColorController;
use App\Http\Controllers\API\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\API\Admin\CourierController;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\InventoryLogController;
use App\Http\Controllers\API\Admin\LocationController;
use App\Http\Controllers\API\Admin\MediaController;
use App\Http\Controllers\API\Admin\NotificationController;
use App\Http\Controllers\API\Admin\NotificationTemplateController;
use App\Http\Controllers\API\Admin\AdminOrderController;
use App\Http\Controllers\API\Admin\OrderStatusController;
use App\Http\Controllers\API\Admin\PaymentMethodController;
use App\Http\Controllers\API\Admin\PermissionController;
use App\Http\Controllers\API\Admin\ProductController as AdminProductController;
use App\Http\Controllers\API\Admin\ReviewController;
use App\Http\Controllers\API\Admin\ReviewStatusController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\SeoController;
use App\Http\Controllers\API\Admin\SettingController;
use App\Http\Controllers\API\Admin\ShippingController;
use App\Http\Controllers\API\Admin\SizeController;
use App\Http\Controllers\API\Admin\TagController;
use App\Http\Controllers\API\Admin\TaxController;
use App\Http\Controllers\API\Admin\UserController;
use App\Http\Controllers\API\Admin\WarehouseController;
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

    // Master Data Management Routes

    // Attributes
    Route::get('/attributes', [AttributeController::class, 'index']);
    Route::post('/attributes', [AttributeController::class, 'store']);
    Route::get('/attributes/{id}', [AttributeController::class, 'show']);
    Route::put('/attributes/{id}', [AttributeController::class, 'update']);
    Route::delete('/attributes/{id}', [AttributeController::class, 'destroy']);

    // Attribute Values
    Route::get('/attribute-values', [AttributeValueController::class, 'index']);
    Route::post('/attribute-values', [AttributeValueController::class, 'store']);
    Route::put('/attribute-values/{id}', [AttributeValueController::class, 'update']);
    Route::delete('/attribute-values/{id}', [AttributeValueController::class, 'destroy']);

    // Banners
    Route::get('/banners', [BannerController::class, 'index']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::get('/banners/{id}', [BannerController::class, 'show']);
    Route::put('/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
    Route::put('/banners/{id}/toggle', [BannerController::class, 'toggle']);

    // Order Statuses
    Route::get('/order-statuses', [OrderStatusController::class, 'index']);
    Route::post('/order-statuses', [OrderStatusController::class, 'store']);
    Route::get('/order-statuses/{id}', [OrderStatusController::class, 'show']);
    Route::put('/order-statuses/{id}', [OrderStatusController::class, 'update']);
    Route::delete('/order-statuses/{id}', [OrderStatusController::class, 'destroy']);

    // Payment Methods
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::get('/payment-methods/{id}', [PaymentMethodController::class, 'show']);
    Route::put('/payment-methods/{id}', [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{id}', [PaymentMethodController::class, 'destroy']);
    Route::put('/payment-methods/{id}/toggle', [PaymentMethodController::class, 'toggle']);

    // Shipping
    Route::get('/shipping/methods', [ShippingController::class, 'methods']);
    Route::post('/shipping/methods', [ShippingController::class, 'storeMethod']);
    Route::put('/shipping/methods/{id}', [ShippingController::class, 'updateMethod']);
    Route::delete('/shipping/methods/{id}', [ShippingController::class, 'deleteMethod']);
    Route::get('/shipping/zones', [ShippingController::class, 'zones']);
    Route::post('/shipping/zones', [ShippingController::class, 'storeZone']);
    Route::put('/shipping/zones/{id}', [ShippingController::class, 'updateZone']);
    Route::delete('/shipping/zones/{id}', [ShippingController::class, 'deleteZone']);
    Route::get('/shipping/rates', [ShippingController::class, 'rates']);
    Route::post('/shipping/rates', [ShippingController::class, 'storeRate']);
    Route::put('/shipping/rates/{id}', [ShippingController::class, 'updateRate']);
    Route::delete('/shipping/rates/{id}', [ShippingController::class, 'deleteRate']);

    // Tax Classes
    Route::get('/tax-classes', [TaxController::class, 'index']);
    Route::post('/tax-classes', [TaxController::class, 'store']);
    Route::get('/tax-classes/{id}', [TaxController::class, 'show']);
    Route::put('/tax-classes/{id}', [TaxController::class, 'update']);
    Route::delete('/tax-classes/{id}', [TaxController::class, 'destroy']);

    // Locations
    Route::get('/countries', [LocationController::class, 'countries']);
    Route::post('/countries', [LocationController::class, 'storeCountry']);
    Route::put('/countries/{id}', [LocationController::class, 'updateCountry']);
    Route::delete('/countries/{id}', [LocationController::class, 'deleteCountry']);
    Route::get('/countries/{countryId}/states', [LocationController::class, 'states']);
    Route::post('/states', [LocationController::class, 'storeState']);
    Route::put('/states/{id}', [LocationController::class, 'updateState']);
    Route::delete('/states/{id}', [LocationController::class, 'deleteState']);
    Route::get('/states/{stateId}/cities', [LocationController::class, 'cities']);
    Route::post('/cities', [LocationController::class, 'storeCity']);
    Route::put('/cities/{id}', [LocationController::class, 'updateCity']);
    Route::delete('/cities/{id}', [LocationController::class, 'deleteCity']);

    // Couriers
    Route::get('/couriers', [CourierController::class, 'index']);
    Route::post('/couriers', [CourierController::class, 'store']);
    Route::put('/couriers/{id}', [CourierController::class, 'update']);
    Route::delete('/couriers/{id}', [CourierController::class, 'destroy']);

    // Review Statuses
    Route::get('/review-statuses', [ReviewStatusController::class, 'index']);
    Route::post('/review-statuses', [ReviewStatusController::class, 'store']);
    Route::put('/review-statuses/{id}', [ReviewStatusController::class, 'update']);
    Route::delete('/review-statuses/{id}', [ReviewStatusController::class, 'destroy']);

    // Warehouses
    Route::get('/warehouses', [WarehouseController::class, 'index']);
    Route::post('/warehouses', [WarehouseController::class, 'store']);
    Route::get('/warehouses/{id}', [WarehouseController::class, 'show']);
    Route::put('/warehouses/{id}', [WarehouseController::class, 'update']);
    Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy']);

    // Inventory Logs
    Route::get('/inventory-logs', [InventoryLogController::class, 'index']);
    Route::post('/inventory-logs', [InventoryLogController::class, 'store']);

    // SEO
    Route::get('/seo-pages', [SeoController::class, 'index']);
    Route::post('/seo-pages', [SeoController::class, 'store']);
    Route::put('/seo-pages/{id}', [SeoController::class, 'update']);
    Route::delete('/seo-pages/{id}', [SeoController::class, 'destroy']);
    Route::get('/redirects', [SeoController::class, 'redirects']);
    Route::post('/redirects', [SeoController::class, 'storeRedirect']);
    Route::put('/redirects/{id}', [SeoController::class, 'updateRedirect']);
    Route::delete('/redirects/{id}', [SeoController::class, 'deleteRedirect']);

    // Media
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::put('/media/{id}', [MediaController::class, 'update']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);
    Route::get('/media/folders', [MediaController::class, 'folders']);
    Route::post('/media/folders', [MediaController::class, 'storeFolder']);
    Route::put('/media/folders/{id}', [MediaController::class, 'updateFolder']);
    Route::delete('/media/folders/{id}', [MediaController::class, 'deleteFolder']);

    // Notification Templates
    Route::get('/notification-templates', [NotificationTemplateController::class, 'index']);
    Route::post('/notification-templates', [NotificationTemplateController::class, 'store']);
    Route::get('/notification-templates/{id}', [NotificationTemplateController::class, 'show']);
    Route::put('/notification-templates/{id}', [NotificationTemplateController::class, 'update']);
    Route::delete('/notification-templates/{id}', [NotificationTemplateController::class, 'destroy']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::get('/settings/groups', [SettingController::class, 'groups']);

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
    Route::get('/brands/{id}', [BrandController::class, 'show']);
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
