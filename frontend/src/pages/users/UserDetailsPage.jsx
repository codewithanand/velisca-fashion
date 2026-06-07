import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, Calendar, Shield,
  Key, Smartphone, Activity, ShoppingBag,
} from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminButton from '../../components/admin/AdminButton';
import AdminLoader from '../../components/admin/AdminLoader';
import useUsersStore from '../../stores/users.store';
import PermissionGuard from '../../components/auth/PermissionGuard';

const roleBadgeVariant = {
  'Super Admin': 'primary',
  'Admin': 'info',
  'Manager': 'warning',
  'Customer': 'default',
};

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUser } = useUsersStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUser(id);
        setUser(data);
      } catch {
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchUser, navigate]);

  if (loading) return <AdminLoader />;
  if (!user) return null;

  const getRoleLabel = () => {
    if (user.roles && user.roles.length > 0) return user.roles[0].name;
    return user.role || 'Customer';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">User Details</h1>
          <p className="text-sm text-text-secondary">View user information and activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <AdminCard>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <AdminBadge variant={user.role === 'blocked' ? 'danger' : 'success'}>
                  {user.role === 'blocked' ? 'Blocked' : 'Active'}
                </AdminBadge>
                <AdminBadge variant={roleBadgeVariant[getRoleLabel()] || 'default'}>
                  {getRoleLabel()}
                </AdminBadge>
              </div>
            </div>
            <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-text-secondary shrink-0" />
                <span className="text-text-primary">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={15} className="text-text-secondary shrink-0" />
                <span className="text-text-primary">{user.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={15} className="text-text-secondary shrink-0" />
                <span className="text-text-primary">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
              <PermissionGuard permission="edit users">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                >
                  Edit User
                </AdminButton>
              </PermissionGuard>
              <PermissionGuard permission="assign roles">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/admin/users/${user.id}/roles`)}
                >
                  Assign Role
                </AdminButton>
              </PermissionGuard>
            </div>
          </AdminCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AdminCard>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Roles & Permissions</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Assigned Roles</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <AdminBadge key={role.id} variant="primary">{role.name}</AdminBadge>
                    ))
                  ) : (
                    <span className="text-sm text-text-secondary">No roles assigned</span>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-sm font-medium text-text-secondary mb-2">
                  Direct Permissions ({user.permissions?.length || 0})
                </p>
                {user.permissions && user.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-text-secondary"
                      >
                        {perm.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">No direct permissions</span>
                )}
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Activity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <ShoppingBag size={14} />
                  Orders
                </div>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <Smartphone size={14} />
                  Last Login
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <Key size={14} />
                  Sessions
                </div>
                <p className="text-2xl font-bold text-text-primary">—</p>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </motion.div>
  );
}
