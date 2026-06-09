import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Truck, ExternalLink, Phone } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useCouriersStore from '../../../stores/couriers.store';

export default function AdminCouriers() {
  const { couriers, loading, fetchCouriers, createCourier, updateCourier, deleteCourier } = useCouriersStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', tracking_url: '', contact_number: '', status: true });
  const [saving, setSaving] = useState(false);
  const { errors, validate, clearErrors, clearField } = useFormValidation({
    name: [{ required: true }],
    tracking_url: [{ url: true }],
    contact_number: [{ pattern: /^[\d\s\+\-\(\)]{7,20}$/ }],
  });

  useEffect(() => { fetchCouriers(); }, [fetchCouriers]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', tracking_url: '', contact_number: '', status: true });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (courier) => {
    setEditing(courier);
    setForm({
      name: courier.name || '',
      tracking_url: courier.tracking_url || '',
      contact_number: courier.contact_number || '',
      status: courier.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCourier(editing.id, form);
      } else {
        await createCourier(form);
      }
      setModalOpen(false);
      fetchCouriers();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCourier(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchCouriers();
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
          <h1 className="text-xl font-bold text-text-primary">Couriers</h1>
          <p className="text-sm text-text-secondary">{couriers.length} couriers</p>
        </div>
        <PermissionGuard permission="create couriers">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Courier
          </AdminButton>
        </PermissionGuard>
      </div>

      {couriers.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Truck} title="No couriers yet" description="Add courier partners for shipping." actionLabel="Add Courier" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {couriers.map((courier) => (
            <motion.div key={courier.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Truck size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={courier.status ? 'success' : 'danger'} className="text-[10px]">
                  {courier.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{courier.name}</h3>
              {courier.tracking_url && (
                <a href={courier.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                  <ExternalLink size={12} />
                  Tracking URL
                </a>
              )}
              {courier.contact_number && (
                <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                  <Phone size={12} />
                  {courier.contact_number}
                </p>
              )}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit couriers">
                  <button onClick={() => openEdit(courier)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete couriers">
                  <button onClick={() => setDeleteConfirm(courier)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Courier' : 'Add Courier'} size="md">
        <div className="space-y-4">
          <AdminInput label="Courier Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Blue Dart" required error={errors.name} />
          <AdminInput label="Tracking URL" value={form.tracking_url} onChange={handleChange('tracking_url')} placeholder="https://track.example.com/{tracking_id}" error={errors.tracking_url} />
          <AdminInput label="Contact Number" value={form.contact_number} onChange={handleChange('contact_number')} placeholder="e.g. 1800-123-456" error={errors.contact_number} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
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
        title="Delete Courier"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
