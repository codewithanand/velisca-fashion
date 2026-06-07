import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Loader from '../ui/Loader';

export default function PublicRoute() {
  const { isAuthenticated, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
