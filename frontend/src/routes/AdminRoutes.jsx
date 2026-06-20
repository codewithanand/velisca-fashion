import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from '../context/admin/AdminContext';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminRoute from '../components/admin/AdminRoute';

const AdminLogin = lazy(() => import('../pages/admin/Login'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/products/List'));
const AdminProductForm = lazy(() => import('../pages/admin/products/Form'));
const AdminCategories = lazy(() => import('../pages/admin/categories/List'));
const AdminOrders = lazy(() => import('../pages/admin/orders/List'));
const AdminOrderDetails = lazy(() => import('../pages/admin/orders/Details'));
const AdminUsers = lazy(() => import('../pages/admin/users/List'));
const AdminUserDetails = lazy(() => import('../pages/admin/users/Details'));
const AdminCreateUser = lazy(() => import('../pages/admin/users/Create'));
const AdminEditUser = lazy(() => import('../pages/admin/users/Edit'));
const AdminRoles = lazy(() => import('../pages/admin/roles/List'));
const AdminCreateRole = lazy(() => import('../pages/admin/roles/Form'));
const AdminEditRole = lazy(() => import('../pages/admin/roles/Form'));
const AdminPermissions = lazy(() => import('../pages/admin/permissions/List'));
const AdminPermissionGroups = lazy(() => import('../pages/admin/permissions/Groups'));
const AdminInventory = lazy(() => import('../pages/admin/products/Inventory'));
const AdminReviews = lazy(() => import('../pages/admin/reviews/List'));
const AdminCollections = lazy(() => import('../pages/admin/marketing/Collections'));
const AdminCoupons = lazy(() => import('../pages/admin/marketing/Coupons'));
const AdminBanners = lazy(() => import('../pages/admin/marketing/Banners'));
const AdminAnalytics = lazy(() => import('../pages/admin/analytics/Index'));
const AdminNotifications = lazy(() => import('../pages/admin/notifications/List'));
const AdminSettings = lazy(() => import('../pages/admin/settings/Index'));

// CMS Routes
const AdminCmsPages = lazy(() => import('../pages/admin/cms/List'));
const AdminCmsPageForm = lazy(() => import('../pages/admin/cms/Form'));
const AdminHomepageBuilder = lazy(() => import('../pages/admin/homepage/Builder'));

// Blog Routes
const AdminBlogs = lazy(() => import('../pages/admin/blogs/List'));
const AdminBlogForm = lazy(() => import('../pages/admin/blogs/Form'));
const AdminBlogCategories = lazy(() => import('../pages/admin/blogCategories/List'));

// Marketing Routes
const AdminCampaigns = lazy(() => import('../pages/admin/marketing/Campaigns'));
const AdminAnnouncements = lazy(() => import('../pages/admin/marketing/Announcements'));
const AdminPopups = lazy(() => import('../pages/admin/marketing/Popups'));
const AdminNewsletters = lazy(() => import('../pages/admin/marketing/Newsletters'));

// Master Data routes
const AdminAttributes = lazy(() => import('../pages/admin/attributes/List'));
const AdminOrderStatuses = lazy(() => import('../pages/admin/orderStatuses/List'));
const AdminPaymentMethods = lazy(() => import('../pages/admin/paymentMethods/List'));
const AdminShipping = lazy(() => import('../pages/admin/shipping/List'));
const AdminTaxes = lazy(() => import('../pages/admin/taxes/List'));
const AdminLocations = lazy(() => import('../pages/admin/locations/List'));
const AdminCouriers = lazy(() => import('../pages/admin/couriers/List'));
const AdminReviewStatuses = lazy(() => import('../pages/admin/reviewStatuses/List'));
const AdminWarehouses = lazy(() => import('../pages/admin/warehouses/List'));
const AdminInventoryLogs = lazy(() => import('../pages/admin/inventoryLogs/List'));
const AdminSeo = lazy(() => import('../pages/admin/seo/List'));
const AdminMedia = lazy(() => import('../pages/admin/media/List'));
const AdminNotificationTemplates = lazy(() => import('../pages/admin/notificationTemplates/List'));

// Master Data: Brands, Colors, Sizes
const AdminBrands = lazy(() => import('../pages/admin/brands/List'));
const AdminColors = lazy(() => import('../pages/admin/colors/List'));
const AdminSizes = lazy(() => import('../pages/admin/sizes/List'));

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
            <Route path="dashboard" element={<AdminDashboard />} />
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
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="popups" element={<AdminPopups />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* Master Data Routes */}
            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="order-statuses" element={<AdminOrderStatuses />} />
            <Route path="payment-methods" element={<AdminPaymentMethods />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="taxes" element={<AdminTaxes />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="couriers" element={<AdminCouriers />} />
            <Route path="review-statuses" element={<AdminReviewStatuses />} />
            <Route path="warehouses" element={<AdminWarehouses />} />
            <Route path="inventory-logs" element={<AdminInventoryLogs />} />
            <Route path="seo" element={<AdminSeo />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="notification-templates" element={<AdminNotificationTemplates />} />

            {/* CMS Routes */}
            <Route path="cms-pages" element={<AdminCmsPages />} />
            <Route path="cms-pages/create" element={<AdminCmsPageForm />} />
            <Route path="cms-pages/edit/:id" element={<AdminCmsPageForm />} />
            <Route path="homepage" element={<AdminHomepageBuilder />} />

            {/* Blog Routes */}
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/create" element={<AdminBlogForm />} />
            <Route path="blogs/edit/:id" element={<AdminBlogForm />} />
            <Route path="blogs/categories" element={<AdminBlogCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="colors" element={<AdminColors />} />
            <Route path="sizes" element={<AdminSizes />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
    </AdminProvider>
  );
}
