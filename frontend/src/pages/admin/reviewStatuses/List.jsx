import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Circle } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useReviewStatusesStore from '../../../stores/reviewStatuses.store';
import useFormValidation from '../../../hooks/useFormValidation';

export default function AdminReviewStatuses() {
  const { reviewStatuses, loading, fetchReviewStatuses, createReviewStatus, updateReviewStatus, deleteReviewStatus } = useReviewStatusesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', color: '#000000', status: true, sort_order: '',
  });
  const [saving, setSaving] = useState(false);

  const rules = {
    name: [{ required: true }],
    slug: [{ slug: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors, validate, clearErrors, clearField } = useFormValidation(rules);

  useEffect(() => { fetchReviewStatuses(); }, [fetchReviewStatuses]);

  const openAdd = () => {
    clearErrors();
    setEditing(null);
    setForm({ name: '', slug: '', color: '#000000', status: true, sort_order: '' });
    setModalOpen(true);
  };

  const openEdit = (rs) => {
    clearErrors();
    setEditing(rs);
    setForm({
      name: rs.name || '',
      slug: rs.slug || '',
      color: rs.color || '#000000',
      status: rs.status ?? true,
      sort_order: rs.sort_order || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateReviewStatus(editing.id, form);
      } else {
        await createReviewStatus(form);
      }
      setModalOpen(false);
      fetchReviewStatuses();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteReviewStatus(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchReviewStatuses();
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
          <h1 className="text-xl font-bold text-text-primary">Review Statuses</h1>
          <p className="text-sm text-text-secondary">{reviewStatuses.length} statuses</p>
        </div>
        <PermissionGuard permission="create review statuses">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Review Status
          </AdminButton>
        </PermissionGuard>
      </div>

      {reviewStatuses.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Circle} title="No review statuses yet" description="Create your first review status." actionLabel="Add Review Status" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviewStatuses.map((rs) => (
            <motion.div key={rs.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Circle size={20} style={{ color: rs.color, fill: rs.color }} />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{rs.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">/{rs.slug}</p>
                  </div>
                </div>
                <AdminBadge variant={rs.status ? 'success' : 'danger'} className="text-[10px]">
                  {rs.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit review statuses">
                  <button onClick={() => openEdit(rs)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete review statuses">
                  <button onClick={() => setDeleteConfirm(rs)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Review Status' : 'Add Review Status'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Status Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Pending Review" required error={errors.name} />
            <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="e.g. pending-review" error={errors.slug} />
          </div>
          <AdminInput label="Color (Hex)" value={form.color} onChange={handleChange('color')} placeholder="#000000" />
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
        title="Delete Review Status"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
