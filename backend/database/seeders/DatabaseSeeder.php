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
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ========== Create Permissions ==========
        $permissionGroups = [
            'Users' => [
                'view users',
                'create users',
                'edit users',
                'delete users',
                'block users',
                'assign roles',
            ],
            'Products' => [
                'view products',
                'create products',
                'edit products',
                'delete products',
                'manage inventory',
            ],
            'Orders' => [
                'view orders',
                'update orders',
                'cancel orders',
                'manage shipments',
            ],
            'Coupons' => [
                'view coupons',
                'create coupons',
                'edit coupons',
                'delete coupons',
            ],
            'Banners' => [
                'view banners',
                'create banners',
                'edit banners',
                'delete banners',
            ],
            'Analytics' => [
                'view analytics',
                'view reports',
            ],
            'Settings' => [
                'manage settings',
                'manage roles',
                'manage permissions',
            ],
        ];

        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permission) {
                Permission::create(['name' => $permission, 'guard_name' => 'web']);
            }
        }

        // ========== Create Roles ==========
        $superAdmin = Role::create(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->givePermissionTo([
            'view users', 'create users', 'edit users', 'block users', 'assign roles',
            'view products', 'create products', 'edit products', 'delete products', 'manage inventory',
            'view orders', 'update orders', 'cancel orders', 'manage shipments',
            'view coupons', 'create coupons', 'edit coupons', 'delete coupons',
            'view banners', 'create banners', 'edit banners', 'delete banners',
            'view analytics', 'view reports',
            'manage settings',
        ]);

        $manager = Role::create(['name' => 'Manager', 'guard_name' => 'web']);
        $manager->givePermissionTo([
            'view users',
            'view products', 'create products', 'edit products', 'manage inventory',
            'view orders', 'update orders',
            'view analytics', 'view reports',
        ]);

        $inventoryManager = Role::create(['name' => 'Inventory Manager', 'guard_name' => 'web']);
        $inventoryManager->givePermissionTo([
            'view products', 'manage inventory',
        ]);

        $orderManager = Role::create(['name' => 'Order Manager', 'guard_name' => 'web']);
        $orderManager->givePermissionTo([
            'view orders', 'update orders', 'cancel orders', 'manage shipments',
        ]);

        $customerSupport = Role::create(['name' => 'Customer Support', 'guard_name' => 'web']);
        $customerSupport->givePermissionTo([
            'view users',
            'view orders', 'update orders', 'cancel orders',
        ]);

        $contentManager = Role::create(['name' => 'Content Manager', 'guard_name' => 'web']);
        $contentManager->givePermissionTo([
            'view products', 'create products', 'edit products',
            'view banners', 'create banners', 'edit banners', 'delete banners',
        ]);

        $customer = Role::create(['name' => 'Customer', 'guard_name' => 'web']);
        $customer->givePermissionTo([]);

        // ========== Create Users ==========
        $adminUser = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@velisca.com',
            'password' => Hash::make('admin123'),
            'role' => User::ROLE_ADMIN,
        ]);
        $adminUser->assignRole('Super Admin');

        $staffUser = User::factory()->create([
            'name' => 'Staff',
            'email' => 'staff@velisca.com',
            'password' => Hash::make('staff123'),
            'role' => User::ROLE_STAFF,
        ]);
        $staffUser->assignRole('Admin');

        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => User::ROLE_CUSTOMER,
        ]);
        $testUser->assignRole('Customer');
    }
}
