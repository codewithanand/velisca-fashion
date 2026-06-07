import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/admin/AdminContext';

function loadAdmin() {
  try {
    const data = localStorage.getItem('admin');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export default function AdminRoute({ roles = ['admin', 'staff'] }) {
  const { admin, loading, hasAnyRole } = useAdmin();

  // Fallback: check localStorage directly if context hasn't caught up
  const localAdmin = admin || loadAdmin();
  const role = localAdmin?.role;
  const hasAccess = role && roles.includes(role);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!localAdmin || !hasAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
