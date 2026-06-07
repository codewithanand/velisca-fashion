import { Outlet } from 'react-router-dom';
import { useAdmin } from '../context/admin/AdminContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopHeader from '../components/admin/AdminTopHeader';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { theme } = useAdmin();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminTopHeader />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
