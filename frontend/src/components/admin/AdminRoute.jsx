import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/admin/AdminContext';

export default function AdminRoute({ roles = ['admin', 'staff'] }) {
  const { admin, loading, hasAnyRole } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
