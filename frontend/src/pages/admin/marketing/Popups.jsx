import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Newspaper, Eye, EyeOff } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import usePopupsStore from '../../../stores/popups.store';

const popupTypes = [
  { value: 'newsletter', label: 'Newsletter Popup' },
  { value: 'offer', label: 'Offer Popup' },
  { value: 'exit_intent', label: 'Exit Intent Popup' },
  { value: 'festival', label: 'Festival Popup' },
  { value: 'discount', label: 'Discount Popup' },
];

const triggerTypes = [
  { value: 'on_load', label: 'On Page Load' },
  { value: 'after_delay', label: 'After Delay' },
  { value: 'on_scroll', label: 'On Scroll' },
  { value: 'exit_intent', label: 'Exit Intent' },
  { value: 'on_click', label: 'On Click' },
];

export default function AdminPopups() {
  const { popups, loading, fetchPopups, createPopup, updatePopup, deletePopup } = usePopupsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '', popup_type: 'newsletter', image: '', message: '',
    cta_text: '', cta_link: '', trigger_type: 'on_load', delay_seconds: 5,
    show_on_mobile: true, settings_json: {}, status: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', popup_type: 'newsletter', image: '', message: '', cta_text: '', cta_link: '', trigger_type: 'on_load', delay_seconds: 5, show_on_mobile: true, settings_json: {}, status: true });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '', popup_type: p.popup_type || 'newsletter', image: p.image || '',
      message: p.message || '', cta_text: p.cta_text || '', cta_link: p.cta_link || '',
      trigger_type: p.trigger_type || 'on_load', delay_seconds: p.delay_seconds ?? 5,
      show_on_mobile: p.show_on_mobile ?? true, settings_json: p.settings_json || {}, status: p.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updatePopup(editing.id, form);
      } else {
        await createPopup(form);
      }
      setModalOpen(false);
      fetchPopups();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deletePopup(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const toggleStatus = async (p) => {
    await updatePopup(p.id, { ...p, status: !p.status });
    fetchPopups();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Popup Campaigns</h1>
          <p className="text-sm text-text-secondary">{popups.length} popups • {popups.filter(p => p.status).length} active</p>
        </div>
        <PermissionGuard permission="manage campaigns">
          <AdminButton onClick={openAdd}><Plus size={16} /> Add Popup</AdminButton>
        </PermissionGuard>
      </div>

      {popups.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Newspaper} title="No popup campaigns" description="Create popups for promotions and newsletters." actionLabel="Add Popup" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popups.map((popup) => (
            <motion.div key={popup.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{popup.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <AdminBadge variant="default" className="text-[10px]">{popup.popup_type}</AdminBadge>
                    <AdminBadge variant="info" className="text-[10px]">{popup.trigger_type}</AdminBadge>
                  </div>
                </div>
                <AdminBadge variant={popup.status ? 'success' : 'danger'} className="text-[10px] shrink-0 ml-2">{popup.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              {popup.message && <p className="text-xs text-text-secondary line-clamp-2 mb-2">{popup.message}</p>}
              <p className="text-[10px] text-text-secondary">Delay: {popup.delay_seconds}s • Mobile: {popup.show_on_mobile ? 'Yes' : 'No'}</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                <button onClick={() => toggleStatus(popup)} className={`p-1.5 rounded-lg transition-colors ${popup.status ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}>
                  {popup.status ? <EyeOff size={14} className="text-warning" /> : <Eye size={14} className="text-success" />}
                </button>
                <button onClick={() => openEdit(popup)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Edit3 size={14} className="text-text-secondary" />
                </button>
                <PermissionGuard permission="manage campaigns">
                  <button onClick={() => setDeleteConfirm(popup)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Popup' : 'Add Popup'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Popup title" required />
            <AdminSelect label="Popup Type" value={form.popup_type} onChange={(e) => setForm({ ...form, popup_type: e.target.value })} options={popupTypes} />
          </div>
          <AdminInput label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Popup message..." className="admin-input min-h-[60px] resize-y" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="CTA Text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="Shop Now" />
            <AdminInput label="CTA Link" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AdminSelect label="Trigger" value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} options={triggerTypes} />
            <AdminInput label="Delay (seconds)" type="number" value={form.delay_seconds} onChange={(e) => setForm({ ...form, delay_seconds: parseInt(e.target.value) || 0 })} min="0" max="300" />
            <label className="flex items-center gap-2 pt-6 cursor-pointer">
              <input type="checkbox" checked={form.show_on_mobile} onChange={(e) => setForm({ ...form, show_on_mobile: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Show on Mobile</span>
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Popup" message={`Delete "${deleteConfirm?.title}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
