import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Warehouse } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useWarehousesStore from '../../../stores/warehouses.store';
import useFormValidation from '../../../hooks/useFormValidation';

export default function AdminWarehouses() {
  const { warehouses, loading, fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehousesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', location: '', status: true,
    email: '', phone: '', address: '', city: '', state: '', country: '', pincode: '', sort_order: '',
  });
  const [saving, setSaving] = useState(false);

  const rules = {
    name: [{ required: true }],
    code: [{ required: true }],
    email: [{ email: true }],
    phone: [{ pattern: /^[\d\s\+\-\(\)]{7,20}$/ }],
    address: [{ required: true }],
    city: [{ required: true }],
    state: [{ required: true }],
    country: [{ required: true }],
    pincode: [{ pattern: /^\d{5,6}$/, message: 'Invalid pincode' }],
    sort_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors, validate, clearErrors, clearField } = useFormValidation(rules);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const openAdd = () => {
    clearErrors();
    setEditing(null);
    setForm({ name: '', code: '', location: '', status: true, email: '', phone: '', address: '', city: '', state: '', country: '', pincode: '', sort_order: '' });
    setModalOpen(true);
  };

  const openEdit = (wh) => {
    clearErrors();
    setEditing(wh);
    setForm({
      name: wh.name || '',
      code: wh.code || '',
      location: wh.location || '',
      status: wh.status ?? true,
      email: wh.email || '',
      phone: wh.phone || '',
      address: wh.address || '',
      city: wh.city || '',
      state: wh.state || '',
      country: wh.country || '',
      pincode: wh.pincode || '',
      sort_order: wh.sort_order || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateWarehouse(editing.id, form);
      } else {
        await createWarehouse(form);
      }
      setModalOpen(false);
      fetchWarehouses();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteWarehouse(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchWarehouses();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearField(field);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Warehouses</h1>
          <p className="text-sm text-text-secondary">{warehouses.length} warehouses</p>
        </div>
        <PermissionGuard permission="create warehouses">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Warehouse
          </AdminButton>
        </PermissionGuard>
      </div>

      {warehouses.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Warehouse} title="No warehouses yet" description="Create your first warehouse to manage inventory." actionLabel="Add Warehouse" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <motion.div key={wh.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                  <Warehouse size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={wh.status ? 'success' : 'danger'} className="text-[10px]">
                  {wh.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{wh.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{wh.code}</p>
              {wh.location && <p className="text-xs text-text-secondary mt-1">{wh.location}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit warehouses">
                  <button onClick={() => openEdit(wh)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete warehouses">
                  <button onClick={() => setDeleteConfirm(wh)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Warehouse' : 'Add Warehouse'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Warehouse Name" value={form.name} onChange={handleChange('name')} placeholder="Enter warehouse name" required error={errors.name} />
            <AdminInput label="Code" value={form.code} onChange={handleChange('code')} placeholder="e.g. WH-MAIN" error={errors.code} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Email" type="email" value={form.email} onChange={handleChange('email')} placeholder="warehouse@example.com" error={errors.email} />
            <AdminInput label="Phone" value={form.phone} onChange={handleChange('phone')} placeholder="+1 234 567 8900" error={errors.phone} />
          </div>
          <AdminInput label="Address" value={form.address} onChange={handleChange('address')} placeholder="Street address" error={errors.address} />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="City" value={form.city} onChange={handleChange('city')} placeholder="City" error={errors.city} />
            <AdminInput label="State" value={form.state} onChange={handleChange('state')} placeholder="State" error={errors.state} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Country" value={form.country} onChange={handleChange('country')} placeholder="Country" error={errors.country} />
            <AdminInput label="Pincode" value={form.pincode} onChange={handleChange('pincode')} placeholder="e.g. 123456" error={errors.pincode} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Location Notes</label>
            <textarea value={form.location} onChange={handleChange('location')} placeholder="Additional location details..." rows={2} className="admin-input w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" error={errors.sort_order} />
          </div>
          <div className="flex items-center gap-2 pt-2">
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
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
