import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useAnnouncementsStore from '../../../stores/announcements.store';

export default function AdminAnnouncements() {
  const { bars, loading, fetchBars, createBar, updateBar, deleteBar } = useAnnouncementsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '', message: '', link: '', background_color: '#000000', text_color: '#ffffff',
    start_date: '', end_date: '', status: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBars(); }, [fetchBars]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', message: '', link: '', background_color: '#000000', text_color: '#ffffff', start_date: '', end_date: '', status: true });
    setModalOpen(true);
  };

  const openEdit = (bar) => {
    setEditing(bar);
    setForm({
      title: bar.title || '', message: bar.message || '', link: bar.link || '',
      background_color: bar.background_color || '#000000', text_color: bar.text_color || '#ffffff',
      start_date: bar.start_date || '', end_date: bar.end_date || '', status: bar.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateBar(editing.id, form);
      } else {
        await createBar(form);
      }
      setModalOpen(false);
      fetchBars();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteBar(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const toggleStatus = async (bar) => {
    await updateBar(bar.id, { ...bar, status: !bar.status });
    fetchBars();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Announcement Bars</h1>
          <p className="text-sm text-text-secondary">{bars.length} bars • {bars.filter(b => b.status).length} active</p>
        </div>
        <PermissionGuard permission="manage campaigns">
          <AdminButton onClick={openAdd}><Plus size={16} /> Add Bar</AdminButton>
        </PermissionGuard>
      </div>

      {bars.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Megaphone} title="No announcement bars" description="Add announcement bars for promotions and alerts." actionLabel="Add Bar" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {bars.map((bar) => (
            <motion.div key={bar.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="admin-card p-4 flex items-center gap-4 group"
              style={{ backgroundColor: bar.background_color || '#f8f8f8' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: bar.text_color || '#000' }}>{bar.title}</h3>
                  <AdminBadge variant={bar.status ? 'success' : 'danger'} className="text-[10px]">{bar.status ? 'Active' : 'Inactive'}</AdminBadge>
                </div>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: bar.text_color || '#666' }}>{bar.message}</p>
                {(bar.start_date || bar.end_date) && (
                  <p className="text-[10px] mt-0.5 opacity-70" style={{ color: bar.text_color || '#666' }}>
                    {bar.start_date && `From ${new Date(bar.start_date).toLocaleDateString()}`}
                    {bar.start_date && bar.end_date && ' '}
                    {bar.end_date && `To ${new Date(bar.end_date).toLocaleDateString()}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleStatus(bar)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
                  {bar.status ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => openEdit(bar)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
                  <Edit3 size={14} />
                </button>
                <PermissionGuard permission="manage campaigns">
                  <button onClick={() => setDeleteConfirm(bar)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement Bar' : 'Add Announcement Bar'} size="lg">
        <div className="space-y-4">
          <AdminInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Free Shipping" required />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Announcement message..." className="admin-input min-h-[60px] resize-y" rows={2} required />
          </div>
          <AdminInput label="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Background Color" type="color" value={form.background_color} onChange={(e) => setForm({ ...form, background_color: e.target.value })} />
            <AdminInput label="Text Color" type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Start Date" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <AdminInput label="End Date" type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
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

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Announcement Bar" message={`Delete "${deleteConfirm?.title}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
