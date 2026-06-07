import useAuthStore from '../../stores/auth.store';

export default function RoleGuard({ roles, children, fallback = null }) {
  const { hasAnyRole } = useAuthStore();

  if (hasAnyRole(roles)) {
    return children;
  }

  return fallback;
}
