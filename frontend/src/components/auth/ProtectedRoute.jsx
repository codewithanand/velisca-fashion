import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function ProtectedRoute() {
  const { user, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
