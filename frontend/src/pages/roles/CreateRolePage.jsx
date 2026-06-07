import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Search, ChevronDown, ChevronRight } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminInput from '../../components/admin/AdminInput';
import AdminLoader from '../../components/admin/AdminLoader';
import useRolesStore from '../../stores/roles.store';
import usePermissionsStore from '../../stores/permissions.store';

const permissionGroupLabels = {
  users: 'User Permissions',
  products: 'Product Permissions',
  orders: 'Order Permissions',
  coupons: 'Coupon Permissions',
  banners: 'Banner Permissions',
  analytics: 'Analytics Permissions',
  settings: 'Settings Permissions',
};

const getGroupFromPermission = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? parts[1].toLowerCase() : 'general';
};

export default function CreateRolePage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createRole, updateRole, fetchRole } = useRolesStore();
  const { permissions, fetchPermissions } = usePermissionsStore();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    fetchPermissions();
    if (isEdit) {
      const load = async () => {
        try {
          const role = await fetchRole(id);
          setForm({
            name: role.name || '',
            description: role.description || '',
            permissions: role.permissions?.map((p) => p.name) || [],
          });
        } catch {
          navigate('/admin/roles');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEdit, fetchRole, fetchPermissions, navigate]);

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const group = getGroupFromPermission(perm.name);
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm.name);
    return acc;
  }, {});

  const filteredGroups = Object.entries(groupedPermissions).reduce((acc, [group, perms]) => {
    const filtered = perms.filter((p) => p.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[group] = filtered;
    return acc;
  }, {});

  const togglePermission = (permName) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter((p) => p !== permName)
        : [...prev.permissions, permName],
    }));
  };

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const toggleAllInGroup = (perms) => {
    const allSelected = perms.every((p) => form.permissions.includes(p));
    if (allSelected) {
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !perms.includes(p)),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...perms])],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Role name is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        permissions: form.permissions,
      };
      if (isEdit) {
        await updateRole(id, payload);
      } else {
        await createRole(payload);
      }
      navigate('/admin/roles');
    } catch (err) {
      if (err.data?.errors) {
        const apiErrors = {};
        Object.entries(err.data.errors).forEach(([key, msgs]) => { apiErrors[key] = msgs[0]; });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: err.message || 'Failed to save role' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/roles')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{isEdit ? 'Edit Role' : 'Create Role'}</h1>
          <p className="text-sm text-text-secondary">
            {isEdit ? 'Update role name and permissions' : 'Define a new role with permissions'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard>
              <h3 className="text-base font-semibold text-text-primary mb-4">Permissions Matrix</h3>

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

              <div className="space-y-3">
                {Object.entries(filteredGroups).map(([group, perms]) => (
                  <div key={group} className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(group) ? (
                          <ChevronDown size={16} className="text-text-secondary" />
                        ) : (
                          <ChevronRight size={16} className="text-text-secondary" />
                        )}
                        <span className="text-sm font-semibold text-text-primary">
                          {permissionGroupLabels[group] || group.charAt(0).toUpperCase() + group.slice(1) + ' Permissions'}
                        </span>
                        <span className="text-xs text-text-secondary">
                          ({perms.filter((p) => form.permissions.includes(p)).length}/{perms.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAllInGroup(perms); }}
                        className="text-xs text-primary hover:text-primary-dark font-medium"
                      >
                        {perms.every((p) => form.permissions.includes(p)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </button>

                    <AnimatePresence>
                      {expandedGroups.has(group) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-3">
                            {perms.map((perm) => (
                              <label
                                key={perm}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={form.permissions.includes(perm)}
                                  onChange={() => togglePermission(perm)}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-text-primary">{perm}</span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard>
              <h3 className="text-base font-semibold text-text-primary mb-4">Role Details</h3>
              <div className="space-y-4">
                <AdminInput
                  label="Role Name"
                  placeholder="e.g. Editor"
                  value={form.name}
                  onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: '' })); }}
                  error={errors.name}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-primary">Description</label>
                  <textarea
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="admin-input resize-none"
                  />
                </div>
              </div>
            </AdminCard>

            <AdminCard className="sticky top-24">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Permissions selected:</span>
                  <span className="font-semibold text-text-primary">{form.permissions.length}</span>
                </div>
                {errors.submit && (
                  <div className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{errors.submit}</div>
                )}
                <AdminButton type="submit" fullWidth disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={16} />
                      {isEdit ? 'Update Role' : 'Create Role'}
                    </span>
                  )}
                </AdminButton>
              </div>
            </AdminCard>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
