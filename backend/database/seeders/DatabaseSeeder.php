<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ========== Create Permissions ==========
        $permissionGroups = [
            'Users' => [
                'view users', 'create users', 'edit users', 'delete users', 'block users', 'assign roles',
            ],
            'Products' => [
                'view products', 'create products', 'edit products', 'delete products', 'manage inventory',
            ],
            'Orders' => [
                'view orders', 'update orders', 'cancel orders', 'manage shipments',
            ],
            'Categories' => [
                'view categories', 'create categories', 'edit categories', 'delete categories',
            ],
            'Reviews' => [
                'view reviews', 'approve reviews', 'delete reviews',
            ],
            'Coupons' => [
                'view coupons', 'create coupons', 'edit coupons', 'delete coupons',
            ],
            'Banners' => [
                'view banners', 'create banners', 'edit banners', 'delete banners',
            ],
            'Analytics' => [
                'view analytics', 'view reports',
            ],
            'Settings' => [
                'manage settings', 'manage roles', 'manage permissions',
            ],
        ];

        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permission) {
                Permission::findOrCreate($permission, 'web');
            }
        }

        // ========== Create Roles ==========
        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::findOrCreate('Admin', 'web');
        $admin->givePermissionTo([
            'view users', 'create users', 'edit users', 'block users', 'assign roles',
            'view products', 'create products', 'edit products', 'delete products', 'manage inventory',
            'view categories', 'create categories', 'edit categories', 'delete categories',
            'view reviews', 'approve reviews', 'delete reviews',
            'view orders', 'update orders', 'cancel orders', 'manage shipments',
            'view coupons', 'create coupons', 'edit coupons', 'delete coupons',
            'view banners', 'create banners', 'edit banners', 'delete banners',
            'view analytics', 'view reports',
            'manage settings',
        ]);

        $manager = Role::findOrCreate('Manager', 'web');
        $manager->givePermissionTo([
            'view users',
            'view products', 'create products', 'edit products', 'manage inventory',
            'view categories', 'create categories', 'edit categories',
            'view reviews', 'approve reviews',
            'view orders', 'update orders',
            'view analytics', 'view reports',
        ]);

        $inventoryManager = Role::findOrCreate('Inventory Manager', 'web');
        $inventoryManager->givePermissionTo([
            'view products', 'manage inventory',
        ]);

        $orderManager = Role::findOrCreate('Order Manager', 'web');
        $orderManager->givePermissionTo([
            'view orders', 'update orders', 'cancel orders', 'manage shipments',
        ]);

        $customerSupport = Role::findOrCreate('Customer Support', 'web');
        $customerSupport->givePermissionTo([
            'view users',
            'view orders', 'update orders', 'cancel orders',
        ]);

        $contentManager = Role::findOrCreate('Content Manager', 'web');
        $contentManager->givePermissionTo([
            'view products', 'create products', 'edit products',
            'view categories', 'create categories', 'edit categories',
            'view banners', 'create banners', 'edit banners', 'delete banners',
        ]);

        $customer = Role::findOrCreate('Customer', 'web');
        $customer->givePermissionTo([]);

        // ========== Create Users ==========
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@velisca.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_ADMIN,
            ]
        );
        $adminUser->assignRole('Super Admin');

        $staffUser = User::firstOrCreate(
            ['email' => 'staff@velisca.com'],
            [
                'name' => 'Staff',
                'password' => Hash::make('staff123'),
                'role' => User::ROLE_STAFF,
            ]
        );
        $staffUser->assignRole('Admin');

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'role' => User::ROLE_CUSTOMER,
            ]
        )->assignRole('Customer');

        // ========== Seed Demo Coupons ==========
        $now = now();
        $coupons = [
            [
                'code' => 'WELCOME20',
                'type' => 'percentage',
                'value' => 20,
                'minimum_amount' => 999,
                'maximum_discount' => 500,
                'usage_limit' => 200,
                'used_count' => 0,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(3),
                'status' => true,
            ],
            [
                'code' => 'FLAT500',
                'type' => 'flat',
                'value' => 500,
                'minimum_amount' => 2499,
                'maximum_discount' => null,
                'usage_limit' => 100,
                'used_count' => 0,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(2),
                'status' => true,
            ],
            [
                'code' => 'FREESHIP',
                'type' => 'free_shipping',
                'value' => 0,
                'minimum_amount' => 499,
                'maximum_discount' => null,
                'usage_limit' => 500,
                'used_count' => 0,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(6),
                'status' => true,
            ],
            [
                'code' => 'SUMMER15',
                'type' => 'percentage',
                'value' => 15,
                'minimum_amount' => 1499,
                'maximum_discount' => 1000,
                'usage_limit' => 150,
                'used_count' => 0,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(1),
                'status' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            \App\Models\Coupon::firstOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }

        // ========== Seed Product Data ==========
        $this->call([
            ProductSeeder::class,
        ]);
    }
}
