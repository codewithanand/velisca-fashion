<?php

use App\Http\Controllers\API\Admin\ActivityLogController;
use App\Http\Controllers\API\Admin\AnalyticsController;
use App\Http\Controllers\API\Admin\BannerController;
use App\Http\Controllers\API\Admin\CategoryController;
use App\Http\Controllers\API\Admin\CouponController;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\NotificationController;
use App\Http\Controllers\API\Admin\OrderController;
use App\Http\Controllers\API\Admin\PermissionController;
use App\Http\Controllers\API\Admin\ProductController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\SettingsController;
use App\Http\Controllers\API\Admin\UserController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Auth\PasswordController;
use App\Http\Controllers\API\Auth\RefreshTokenController;
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
| Admin Routes (requires sanctum auth + admin/staff role)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role:' . implode(',', [
    \App\Models\User::ROLE_ADMIN,
    \App\Models\User::ROLE_STAFF,
])])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

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

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Coupons
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);

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

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::delete('/activity-logs/clear', [ActivityLogController::class, 'clear']);

    // Admin auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
