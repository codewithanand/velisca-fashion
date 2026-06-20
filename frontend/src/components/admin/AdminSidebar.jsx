import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Percent,
  Image,
  BarChart3,
  Bell,
  Settings,
  X,
  Layers,
  PackageOpen,
  Shield,
  ShieldCheck,
  Key,
  Star,
  MessageSquare,
  Grid3X3,
  CreditCard,
  Truck,
  Receipt,
  Globe,
  Building2,
  Warehouse,
  FileText,
  Mail,
  ListOrdered,
  Hash,
  Palette,
  Ruler,
  Newspaper,
  Megaphone,
  Square,
  Layout,
  BookOpen,
  PenSquare,
} from 'lucide-react';
import { useAdmin } from '../../context/admin/AdminContext';
import AdminBadge from './AdminBadge';

const navSections = [
  {
    label: 'Dashboard',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true, roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/admin/cms-pages', icon: FileText, label: 'CMS Pages', roles: ['admin', 'staff'] },
      { path: '/admin/homepage', icon: Layout, label: 'Homepage Builder', roles: ['admin', 'staff'] },
      { path: '/admin/blogs', icon: BookOpen, label: 'Blog Posts', roles: ['admin', 'staff'] },
      { path: '/admin/media', icon: Image, label: 'Media Library', roles: ['admin', 'staff'] },
      { path: '/admin/seo', icon: Globe, label: 'SEO', roles: ['admin', 'staff'] },
      { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { path: '/admin/products', icon: Package, label: 'Products', roles: ['admin', 'staff'] },
      { path: '/admin/categories', icon: Layers, label: 'Categories', roles: ['admin', 'staff'] },
      { path: '/admin/collections', icon: Star, label: 'Collections', roles: ['admin', 'staff'] },
      { path: '/admin/attributes', icon: Grid3X3, label: 'Attributes', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Masters',
    items: [
      { path: '/admin/brands', icon: Globe, label: 'Brands', roles: ['admin', 'staff'] },
      { path: '/admin/colors', icon: Palette, label: 'Colors', roles: ['admin', 'staff'] },
      { path: '/admin/sizes', icon: Ruler, label: 'Sizes', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Sales',
    items: [
      { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'staff'] },
      { path: '/admin/coupons', icon: Percent, label: 'Coupons', roles: ['admin'] },
      { path: '/admin/shipping', icon: Truck, label: 'Shipping', roles: ['admin', 'staff'] },
      { path: '/admin/couriers', icon: Building2, label: 'Couriers', roles: ['admin', 'staff'] },
      { path: '/admin/locations', icon: Globe, label: 'Locations', roles: ['admin', 'staff'] },
      { path: '/admin/taxes', icon: Receipt, label: 'Taxes', roles: ['admin', 'staff'] },
      { path: '/admin/payment-methods', icon: CreditCard, label: 'Payment Methods', roles: ['admin', 'staff'] },
      { path: '/admin/order-statuses', icon: ListOrdered, label: 'Order Statuses', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { path: '/admin/banners', icon: Image, label: 'Banners', roles: ['admin', 'staff'] },
      { path: '/admin/campaigns', icon: Megaphone, label: 'Campaigns', roles: ['admin', 'staff'] },
      { path: '/admin/announcements', icon: Newspaper, label: 'Announcements', roles: ['admin', 'staff'] },
      { path: '/admin/popups', icon: Square, label: 'Popups', roles: ['admin', 'staff'] },
      { path: '/admin/newsletters', icon: Mail, label: 'Newsletter', roles: ['admin', 'staff'] },
      { path: '/admin/coupons', icon: Percent, label: 'Coupons', roles: ['admin'] },
      { path: '/admin/notification-templates', icon: PenSquare, label: 'Notification Templates', roles: ['admin'] },
    ],
  },
  {
    label: 'Customers',
    items: [
      { path: '/admin/users', icon: Users, label: 'Users', roles: ['admin', 'staff'] },
      { path: '/admin/review-statuses', icon: Hash, label: 'Review Statuses', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/admin/warehouses', icon: Warehouse, label: 'Warehouses', roles: ['admin', 'staff'] },
      { path: '/admin/inventory', icon: PackageOpen, label: 'Stock', roles: ['admin', 'staff'] },
      { path: '/admin/inventory-logs', icon: FileText, label: 'Inventory Logs', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'staff'] },
      { path: '/admin/notifications', icon: Bell, label: 'Notifications', roles: ['admin'] },
      { path: '/admin/roles', icon: ShieldCheck, label: 'Roles', roles: ['admin'] },
      { path: '/admin/permissions', icon: Key, label: 'Permissions', roles: ['admin'] },
      { path: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
    ],
  },
];

const roleBadge = {
  admin: { variant: 'primary', label: 'Admin' },
  staff: { variant: 'info', label: 'Staff' },
};

export default function AdminSidebar() {
  const { sidebarOpen, setSidebarOpen, admin, hasAnyRole } = useAdmin();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Velisca" className="w-8 h-8 rounded-lg" />
          <div>
            <h2 className="text-sm font-bold text-text-primary">Velisca</h2>
            <p className="text-[10px] text-text-secondary -mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <X size={18} className="text-text-secondary" />
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Shield size={12} className="text-text-secondary" />
          <span className="text-xs text-text-secondary">Role:</span>
          <AdminBadge variant={roleBadge[admin?.role]?.variant || 'default'} className="text-[10px]">
            {roleBadge[admin?.role]?.label || admin?.role}
          </AdminBadge>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-3 admin-scrollbar">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.some((role) => hasAnyRole([role]))
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <p className="text-[10px] text-text-secondary text-center">
          Velisca Admin v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 h-screen sidebar-gradient border-r border-border/50 fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
