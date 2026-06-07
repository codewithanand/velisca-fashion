import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, SlidersHorizontal, Eye, Edit3,
  UserX, UserCheck, Shield,
} from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminButton from '../../components/admin/AdminButton';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminLoader from '../../components/admin/AdminLoader';
import PermissionGuard from '../../components/auth/PermissionGuard';
import useUsersStore from '../../stores/users.store';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Customer', label: 'Customer' },
];

const roleBadgeVariant = {
  'Super Admin': 'primary',
  'Admin': 'info',
  'Manager': 'warning',
  'Inventory Manager': 'default',
  'Order Manager': 'info',
  'Customer Support': 'warning',
  'Content Manager': 'default',
  'Customer': 'default',
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { users, loading, pagination, fetchUsers, toggleBlock, deleteUser } = useUsersStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = useCallback((pageNum, filters) => {
    const params = { page: pageNum || page, per_page: 20 };
    const f = filters || { search, statusFilter, roleFilter };
    if (f.search) params.search = f.search;
    if (f.statusFilter) params.status = f.statusFilter;
    if (f.roleFilter) params.role = f.roleFilter;
    fetchUsers(params);
  }, [page, search, statusFilter, roleFilter, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (value) => { setSearch(value); setPage(1); };
  const handleStatusChange = (value) => { setStatusFilter(value); setPage(1); };
  const handleRoleChange = (value) => { setRoleFilter(value); setPage(1); };

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggleBlock = async () => {
    if (!blockConfirm) return;
    await toggleBlock(blockConfirm.id);
    setBlockConfirm(null);
    loadUsers();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteUser(deleteConfirm.id);
    setDeleteConfirm(null);
    loadUsers();
  };

  const getRoleLabel = (user) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.role || 'Customer';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-secondary">{pagination.total} registered users</p>
        </div>
        <PermissionGuard permission="create users">
          <AdminButton onClick={() => navigate('/admin/users/create')}>
            <Plus size={16} />
            Add User
          </AdminButton>
        </PermissionGuard>
      </div>

      <AdminCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="admin-input pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                showFilters || statusFilter || roleFilter
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-text-secondary hover:bg-secondary'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {(statusFilter || roleFilter) && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="admin-select"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="admin-select"
              >
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </motion.div>
          )}
        </div>

        {loading ? <AdminLoader /> : users.length === 0 ? (
          <AdminEmptyState
            title="No users found"
            description={search || statusFilter || roleFilter ? 'No users match your filters.' : 'No users registered yet.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 mt-4">
              <table className="admin-table mobile-table-card">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="table-row-hover">
                      <td data-label="User">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-primary">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Phone">
                        <span className="text-sm text-text-secondary">{user.phone || '—'}</span>
                      </td>
                      <td data-label="Role">
                        <AdminBadge variant={roleBadgeVariant[getRoleLabel(user)] || 'default'}>
                          {getRoleLabel(user)}
                        </AdminBadge>
                      </td>
                      <td data-label="Status">
                        <AdminBadge variant={user.role === 'blocked' ? 'danger' : 'success'}>
                          {user.role === 'blocked' ? 'Blocked' : 'Active'}
                        </AdminBadge>
                      </td>
                      <td data-label="Created">
                        <span className="text-sm text-text-secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td data-label="Actions" className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="view users">
                            <button
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                              title="View User"
                            >
                              <Eye size={14} className="text-text-secondary" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="edit users">
                            <button
                              onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                              title="Edit User"
                            >
                              <Edit3 size={14} className="text-text-secondary" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="assign roles">
                            <button
                              onClick={() => navigate(`/admin/users/${user.id}/roles`)}
                              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                              title="Assign Role"
                            >
                              <Shield size={14} className="text-text-secondary" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="block users">
                            <button
                              onClick={() => setBlockConfirm(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.role === 'blocked' ? 'hover:bg-green-50' : 'hover:bg-red-50'
                              }`}
                              title={user.role === 'blocked' ? 'Unblock User' : 'Block User'}
                            >
                              {user.role === 'blocked' ? (
                                <UserCheck size={14} className="text-green-600" />
                              ) : (
                                <UserX size={14} className="text-danger" />
                              )}
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="delete users">
                            <button
                              onClick={() => setDeleteConfirm(user)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={pagination.page}
              totalPages={pagination.last_page}
              onPageChange={setPage}
            />
          </>
        )}
      </AdminCard>

      <AdminConfirmDialog
        isOpen={!!blockConfirm}
        onClose={() => setBlockConfirm(null)}
        onConfirm={handleToggleBlock}
        title={blockConfirm?.role === 'blocked' ? 'Unblock User' : 'Block User'}
        message={
          blockConfirm?.role === 'blocked'
            ? `Unblock ${blockConfirm?.name}? They will regain access to their account.`
            : `Block ${blockConfirm?.name}? They will lose access to their account.`
        }
        confirmLabel={blockConfirm?.role === 'blocked' ? 'Unblock' : 'Block'}
        variant={blockConfirm?.role === 'blocked' ? 'primary' : 'danger'}
      />

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Permanently delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
