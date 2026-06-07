import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Shield, Trash2, Plus,
} from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminLoader from '../../../components/admin/AdminLoader';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import usePermissionsStore from '../../../stores/permissions.store';

export default function PermissionsPage() {
  const { permissions, loading, fetchPermissions, createPermission, deletePermission } = usePermissionsStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const filtered = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, perm) => {
    const parts = perm.name.split(' ');
    const group = parts.length > 1 ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createPermission(newName.trim());
      setNewName('');
      setShowCreate(false);
      fetchPermissions();
    } catch {
      // handle error
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deletePermission(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchPermissions();
    } catch {
      setDeleteConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Permissions</h1>
          <p className="text-sm text-text-secondary">{permissions.length} permissions configured</p>
        </div>
        <PermissionGuard permission="manage permissions">
          <AdminButton onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Add Permission
          </AdminButton>
        </PermissionGuard>
      </div>

      <AdminCard>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="admin-input pl-10"
          />
        </div>

        {loading ? <AdminLoader /> : filtered.length === 0 ? (
          <AdminEmptyState
            title="No permissions found"
            description={search ? 'No permissions match your search.' : 'No permissions configured yet.'}
            actionLabel={!search ? 'Add Permission' : undefined}
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(grouped).map(([group, perms]) => (
              <div key={group} className="border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">{group} Permissions</h3>
                  <AdminBadge variant="default" className="ml-auto text-[10px]">{perms.length}</AdminBadge>
                </div>
                <div className="space-y-1">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-secondary/50 group"
                    >
                      <span className="text-sm text-text-primary">{perm.name}</span>
                      <PermissionGuard permission="manage permissions">
                        <button
                          onClick={() => setDeleteConfirm(perm)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={12} className="text-danger" />
                        </button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminModal isOpen={showCreate} onClose={() => { setShowCreate(false); setNewName(''); }} title="Add Permission" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Permission Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. view reports"
              className="admin-input"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <p className="text-xs text-text-secondary">Use format: <code className="bg-secondary px-1 rounded">action subject</code></p>
          </div>
          <div className="flex justify-end gap-2">
            <AdminButton variant="ghost" onClick={() => { setShowCreate(false); setNewName(''); }}>Cancel</AdminButton>
            <AdminButton onClick={handleCreate} disabled={!newName.trim()}>Create</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Permission"
        message={`Delete the "{deleteConfirm?.name}" permission? This may affect roles that use this permission.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
