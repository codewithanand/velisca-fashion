import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/auth.store';

export default function ProtectedRoute({ roles }) {
  const { user, hasAnyRole } = useAuthStore();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
