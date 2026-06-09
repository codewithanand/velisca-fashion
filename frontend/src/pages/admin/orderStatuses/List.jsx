import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Flag } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useOrderStatusesStore from '../../../stores/orderStatuses.store';

export default function AdminOrderStatuses() {
  const { orderStatuses, loading, fetchOrderStatuses, createOrderStatus, updateOrderStatus, deleteOrderStatus } = useOrderStatusesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', color: '#6B7280', sort_order: 0, is_final: false, status: true });
  const [saving, setSaving] = useState(false);

  const rules = {
    name: [{ required: true }],
    slug: [{ slug: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors, validate, clearErrors, clearField } = useFormValidation(rules);

  useEffect(() => { fetchOrderStatuses(); }, [fetchOrderStatuses]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', color: '#6B7280', sort_order: 0, is_final: false, status: true });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (status) => {
    setEditing(status);
    setForm({
      name: status.name || '',
      slug: status.slug || '',
      color: status.color || '#6B7280',
      sort_order: status.sort_order || 0,
      is_final: status.is_final || false,
      status: status.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateOrderStatus(editing.id, form);
      } else {
        await createOrderStatus(form);
      }
      setModalOpen(false);
      fetchOrderStatuses();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteOrderStatus(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchOrderStatuses();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    clearField(field);
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Order Statuses</h1>
          <p className="text-sm text-text-secondary">{orderStatuses.length} statuses</p>
        </div>
        <PermissionGuard permission="create order statuses">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Status
          </AdminButton>
        </PermissionGuard>
      </div>

      {orderStatuses.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Flag} title="No order statuses yet" description="Create statuses to track order progress." actionLabel="Add Status" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderStatuses.map((status) => (
            <motion.div key={status.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color || '#6B7280' }} />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{status.name}</h3>
                    <p className="text-xs text-text-secondary">/{status.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {status.is_final && <AdminBadge variant="info" className="text-[10px]">Is Final</AdminBadge>}
                  <AdminBadge variant={status.status ? 'success' : 'danger'} className="text-[10px]">
                    {status.status ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </div>
              </div>
              <p className="text-xs text-text-secondary">Sort Order: {status.sort_order || 0}</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit order statuses">
                  <button onClick={() => openEdit(status)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete order statuses">
                  <button onClick={() => setDeleteConfirm(status)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Order Status' : 'Add Order Status'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Status Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Processing" required error={errors.name} />
            <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="e.g. processing" error={errors.slug} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={handleChange('color')} className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                <span className="text-xs text-text-secondary">{form.color}</span>
              </div>
            </div>
            <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" error={errors.sort_order} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_final} onChange={handleChange('is_final')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Is Final</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Order Status"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
