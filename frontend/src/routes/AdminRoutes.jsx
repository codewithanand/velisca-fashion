import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from '../context/admin/AdminContext';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminRoute from '../components/admin/AdminRoute';

const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('../pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminOrderDetails = lazy(() => import('../pages/admin/AdminOrderDetails'));
const AdminUsers = lazy(() => import('../pages/users/UsersPage'));
const AdminUserDetails = lazy(() => import('../pages/users/UserDetailsPage'));
const AdminCreateUser = lazy(() => import('../pages/users/CreateUserPage'));
const AdminEditUser = lazy(() => import('../pages/users/EditUserPage'));
const AdminRoles = lazy(() => import('../pages/roles/RolesPage'));
const AdminCreateRole = lazy(() => import('../pages/roles/CreateRolePage'));
const AdminEditRole = lazy(() => import('../pages/roles/CreateRolePage'));
const AdminPermissions = lazy(() => import('../pages/permissions/PermissionsPage'));
const AdminPermissionGroups = lazy(() => import('../pages/permissions/PermissionGroupsPage'));
const AdminInventory = lazy(() => import('../pages/admin/AdminInventory'));
const AdminCoupons = lazy(() => import('../pages/admin/AdminCoupons'));
const AdminBanners = lazy(() => import('../pages/admin/AdminBanners'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

export default function AdminRoutes() {
  return (
    <AdminProvider>
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        {/* Admin Auth */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<AdminLogin />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />

            {/* User Management */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/create" element={<AdminCreateUser />} />
            <Route path="users/:id" element={<AdminUserDetails />} />
            <Route path="users/edit/:id" element={<AdminEditUser />} />
            <Route path="users/:id/roles" element={<AdminEditUser />} />

            {/* Role Management */}
            <Route path="roles" element={<AdminRoles />} />
            <Route path="roles/create" element={<AdminCreateRole />} />
            <Route path="roles/:id/edit" element={<AdminEditRole />} />

            {/* Permission Management */}
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="permissions/groups" element={<AdminPermissionGroups />} />

            <Route path="inventory" element={<AdminInventory />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
    </AdminProvider>
  );
}
