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
} from 'lucide-react';
import { useAdmin } from '../../context/admin/AdminContext';
import AdminBadge from './AdminBadge';

const allNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, roles: ['admin', 'staff'] },
  { path: '/admin/products', icon: Package, label: 'Products', roles: ['admin', 'staff'] },
  { path: '/admin/categories', icon: Layers, label: 'Categories', roles: ['admin', 'staff'] },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'staff'] },
  { path: '/admin/inventory', icon: PackageOpen, label: 'Inventory', roles: ['admin', 'staff'] },
  { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews', roles: ['admin', 'staff'] },
  { path: '/admin/collections', icon: Star, label: 'Collections', roles: ['admin', 'staff'] },
  { path: '/admin/users', icon: Users, label: 'Users', roles: ['admin', 'staff'] },
  { path: '/admin/roles', icon: ShieldCheck, label: 'Roles', roles: ['admin'] },
  { path: '/admin/permissions', icon: Key, label: 'Permissions', roles: ['admin'] },
  { path: '/admin/coupons', icon: Percent, label: 'Coupons', roles: ['admin'] },
  { path: '/admin/banners', icon: Image, label: 'Banners', roles: ['admin', 'staff'] },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'staff'] },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications', roles: ['admin'] },
  { path: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

const roleBadge = {
  admin: { variant: 'primary', label: 'Admin' },
  staff: { variant: 'info', label: 'Staff' },
};

export default function AdminSidebar() {
  const { sidebarOpen, setSidebarOpen, admin, hasAnyRole } = useAdmin();

  const navItems = allNavItems.filter((item) =>
    item.roles.some((role) => hasAnyRole([role]))
  );

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

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 admin-scrollbar">
        {navItems.map((item) => (
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
