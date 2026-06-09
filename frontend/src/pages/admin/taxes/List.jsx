import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Percent } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useTaxesStore from '../../../stores/taxes.store';

export default function AdminTaxes() {
  const { taxes, loading, fetchTaxes, createTax, updateTax, deleteTax } = useTaxesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', rate: '', country: '', state: '', status: true });
  const [saving, setSaving] = useState(false);
  const { errors, validate, clearErrors, clearField } = useFormValidation({
    name: [{ required: true }],
    rate: [{ required: true }, { numeric: true }, { min: 0 }, { max: 100 }],
    country: [{ minLength: 2 }],
    state: [{ minLength: 2 }],
  });

  useEffect(() => { fetchTaxes(); }, [fetchTaxes]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', rate: '', country: '', state: '', status: true });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (tax) => {
    setEditing(tax);
    setForm({
      name: tax.name || '',
      rate: tax.rate?.toString() || '',
      country: tax.country || '',
      state: tax.state || '',
      status: tax.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateTax(editing.id, form);
      } else {
        await createTax(form);
      }
      setModalOpen(false);
      fetchTaxes();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteTax(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchTaxes();
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
          <h1 className="text-xl font-bold text-text-primary">Tax Classes</h1>
          <p className="text-sm text-text-secondary">{taxes.length} tax classes</p>
        </div>
        <PermissionGuard permission="create taxes">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Tax Class
          </AdminButton>
        </PermissionGuard>
      </div>

      {taxes.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Percent} title="No tax classes yet" description="Create tax classes for your store locations." actionLabel="Add Tax Class" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxes.map((tax) => (
            <motion.div key={tax.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Percent size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={tax.status ? 'success' : 'danger'} className="text-[10px]">
                  {tax.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{tax.name}</h3>
              <p className="text-lg font-bold text-text-primary mt-1">{Number(tax.rate || 0)}%</p>
              <div className="flex items-center gap-2 mt-1">
                {tax.country && <AdminBadge variant="info" className="text-[10px]">{tax.country}</AdminBadge>}
                {tax.state && <AdminBadge variant="default" className="text-[10px]">{tax.state}</AdminBadge>}
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit taxes">
                  <button onClick={() => openEdit(tax)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete taxes">
                  <button onClick={() => setDeleteConfirm(tax)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tax Class' : 'Add Tax Class'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Tax Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. GST" required error={errors.name} />
            <AdminInput label="Rate (%)" type="number" value={form.rate} onChange={handleChange('rate')} placeholder="e.g. 18" required error={errors.rate} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Country" value={form.country} onChange={handleChange('country')} placeholder="e.g. India" error={errors.country} />
            <AdminInput label="State" value={form.state} onChange={handleChange('state')} placeholder="e.g. Delhi" error={errors.state} />
          </div>
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
        title="Delete Tax Class"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
