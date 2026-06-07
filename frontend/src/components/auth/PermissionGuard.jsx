import useAuthStore from '../../stores/auth.store';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = useAuthStore();

  if (hasPermission(permission)) {
    return children;
  }

  return fallback;
}
