import { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import Loader from '../components/ui/Loader';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import AdminRoutes from './AdminRoutes';
import routes from '../config/routes';

export default function AppRoutes() {
  const location = useLocation();

  const standaloneRoutes = routes.filter((r) => !r.showHeader);
  const layoutRoutes = routes.filter((r) => r.showHeader);

  const publicPaths = ['/', '/onboarding', '/login', '/signup', '/forgot-password', '/reset-password'];

  return (
    <Suspense fallback={<Loader fullScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public standalone routes (splash, onboarding, login, signup) */}
          {standaloneRoutes
            .filter((r) => publicPaths.includes(r.path))
            .map((r) => (
              <Route key={r.path} element={<PublicRoute />}>
                <Route path={r.path} element={<r.component />} />
              </Route>
            ))}

          {/* Standalone routes not behind PublicRoute (e.g. reels, gallery) */}
          {standaloneRoutes
            .filter((r) => !publicPaths.includes(r.path) && r.path !== '*')
            .map((r) => (
              <Route key={r.path} path={r.path} element={<r.component />} />
            ))}

          {/* Protected layout routes (require auth) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {layoutRoutes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  element={<r.component />}
                />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
