import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/admin/AdminContext';
import config from '../../config';
import { getAccessToken } from '../../services/api';
import AdminBadge from './AdminBadge';

const roleBadge = {
  admin: { variant: 'primary', label: 'Admin' },
  staff: { variant: 'info', label: 'Staff' },
};

export default function AdminTopHeader() {
  const navigate = useNavigate();
  const { toggleSidebar, theme, setTheme, admin, logoutAdmin } = useAdmin();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(`${config.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch {
      // Proceed with local logout even if API call fails
    }
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <header className="glass-header sticky top-0 z-20">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu size={20} className="text-text-primary" />
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 min-w-[240px]">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search in admin..."
              className="bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 flex-1 border-0 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === 'light' ? (
              <Moon size={18} className="text-text-secondary" />
            ) : (
              <Sun size={18} className="text-text-secondary" />
            )}
          </button>

          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {admin?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {admin?.name || 'Admin'}
                </p>
                <div className="flex items-center gap-1">
                  <AdminBadge variant={roleBadge[admin?.role]?.variant || 'default'} className="text-[10px]">
                    {roleBadge[admin?.role]?.label || admin?.role}
                  </AdminBadge>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProfileMenu(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-border/50 py-1 z-20"
                  >
                    <div className="px-4 py-2 border-b border-border/50">
                      <p className="text-sm font-medium text-text-primary">{admin?.name}</p>
                      <p className="text-xs text-text-secondary">{admin?.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-secondary transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
