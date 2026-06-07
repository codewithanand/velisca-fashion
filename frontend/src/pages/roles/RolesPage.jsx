import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Users, ShieldCheck,
} from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminLoader from '../../components/admin/AdminLoader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import PermissionGuard from '../../components/auth/PermissionGuard';
import useRolesStore from '../../stores/roles.store';

export default function RolesPage() {
  const navigate = useNavigate();
  const { roles, loading, fetchRoles, deleteRole } = useRolesStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadRoles = useCallback(() => {
    fetchRoles({ per_page: 50 });
  }, [fetchRoles]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteRole(deleteConfirm.id);
      setDeleteConfirm(null);
      loadRoles();
    } catch {
      setDeleteConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Roles</h1>
          <p className="text-sm text-text-secondary">{roles.length} roles configured</p>
        </div>
        <PermissionGuard permission="manage roles">
          <AdminButton onClick={() => navigate('/admin/roles/create')}>
            <Plus size={16} />
            Create Role
          </AdminButton>
        </PermissionGuard>
      </div>

      {loading ? <AdminLoader /> : roles.length === 0 ? (
        <AdminEmptyState
          title="No roles found"
          description="Create your first role to get started."
          actionLabel="Create Role"
          onAction={() => navigate('/admin/roles/create')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <AdminCard key={role.id} hover>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShieldCheck size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{role.name}</h3>
                      <p className="text-xs text-text-secondary capitalize">{role.guard_name} guard</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">
                      {role.permissions?.length || 0} permissions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">
                      {role.users_count || 0} users
                    </span>
                  </div>
                </div>

                {role.permissions && role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {role.permissions.slice(0, 4).map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-text-secondary"
                      >
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="text-[10px] text-text-secondary">+{role.permissions.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">
                    Created {new Date(role.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <PermissionGuard permission="manage roles">
                      <button
                        onClick={() => navigate(`/admin/roles/${role.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Edit Role"
                      >
                        <Edit3 size={13} className="text-text-secondary" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="manage roles">
                      <button
                        onClick={() => setDeleteConfirm(role)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Role"
                        disabled={role.name === 'Super Admin'}
                      >
                        <Trash2 size={13} className="text-danger" />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        message={`Permanently delete the "${deleteConfirm?.name}" role? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
