import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, CreditCard, ToggleLeft, RotateCcw, DollarSign } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import usePaymentMethodsStore from '../../../stores/paymentMethods.store';
import useFormValidation from '../../../hooks/useFormValidation';

export default function AdminPaymentMethods() {
  const { paymentMethods, loading, fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentMethodsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', icon: '', gateway: '', supports_refund: false, supports_partial_payment: false, sort_order: 0, status: true });
  const [saving, setSaving] = useState(false);

  const rules = {
    name: [{ required: true }],
    code: [{ required: true }, { slug: true }],
    icon: [{ url: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors, validate, clearErrors, clearField } = useFormValidation(rules);

  useEffect(() => { fetchPaymentMethods(); }, [fetchPaymentMethods]);

  const openAdd = () => {
    clearErrors();
    setEditing(null);
    setForm({ name: '', code: '', icon: '', gateway: '', supports_refund: false, supports_partial_payment: false, sort_order: 0, status: true });
    setModalOpen(true);
  };

  const openEdit = (pm) => {
    clearErrors();
    setEditing(pm);
    setForm({
      name: pm.name || '',
      code: pm.code || '',
      icon: pm.icon || '',
      gateway: pm.gateway || '',
      supports_refund: pm.supports_refund || false,
      supports_partial_payment: pm.supports_partial_payment || false,
      sort_order: pm.sort_order || 0,
      status: pm.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updatePaymentMethod(editing.id, form);
      } else {
        await createPaymentMethod(form);
      }
      setModalOpen(false);
      fetchPaymentMethods();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deletePaymentMethod(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchPaymentMethods();
  };

  const handleToggleStatus = async (pm) => {
    try {
      await updatePaymentMethod(pm.id, { status: !pm.status });
      fetchPaymentMethods();
    } catch { /* ignore */ }
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
          <h1 className="text-xl font-bold text-text-primary">Payment Methods</h1>
          <p className="text-sm text-text-secondary">{paymentMethods.length} methods</p>
        </div>
        <PermissionGuard permission="create payment methods">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Method
          </AdminButton>
        </PermissionGuard>
      </div>

      {paymentMethods.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={CreditCard} title="No payment methods yet" description="Add payment methods for your store." actionLabel="Add Method" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((pm) => (
            <motion.div key={pm.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                  {pm.icon ? (
                    <img src={pm.icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <CreditCard size={20} className="text-text-secondary" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {pm.supports_refund && <RotateCcw size={14} className="text-info" title="Supports refund" />}
                  {pm.supports_partial_payment && <DollarSign size={14} className="text-warning" title="Supports partial payment" />}
                  <AdminBadge variant={pm.status ? 'success' : 'danger'} className="text-[10px]">
                    {pm.status ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{pm.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">Code: {pm.code}</p>
              {pm.gateway && <p className="text-xs text-text-secondary">Gateway: {pm.gateway}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggleStatus(pm)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                  <ToggleLeft size={12} className="inline mr-1" /> {pm.status ? 'Deactivate' : 'Activate'}
                </button>
                <PermissionGuard permission="edit payment methods">
                  <button onClick={() => openEdit(pm)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete payment methods">
                  <button onClick={() => setDeleteConfirm(pm)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payment Method' : 'Add Payment Method'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Method Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Credit Card" required error={errors.name} />
            <AdminInput label="Code" value={form.code} onChange={handleChange('code')} placeholder="e.g. credit_card" error={errors.code} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Icon URL" value={form.icon} onChange={handleChange('icon')} placeholder="https://..." error={errors.icon} />
            <AdminInput label="Gateway" value={form.gateway} onChange={handleChange('gateway')} placeholder="e.g. stripe" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.supports_refund} onChange={handleChange('supports_refund')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Supports Refund</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.supports_partial_payment} onChange={handleChange('supports_partial_payment')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Supports Partial Payment</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" error={errors.sort_order} />
            <label className="flex items-center gap-2 cursor-pointer pt-6">
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
        title="Delete Payment Method"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
