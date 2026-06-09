import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useBannersStore from '../../../stores/banners.store';

const typeBadge = {
  hero: 'primary',
  offer: 'success',
  category: 'info',
  collection: 'warning',
  popup: 'danger',
};

export default function AdminBanners() {
  const { banners, loading, fetchBanners, createBanner, updateBanner, deleteBanner } = useBannersStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'hero', image: '', mobile_image: '', link: '', button_text: '',
    sort_order: 0, start_date: '', end_date: '', status: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', type: 'hero', image: '', mobile_image: '', link: '', button_text: '', sort_order: 0, start_date: '', end_date: '', status: true });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '',
      type: b.type || 'hero',
      image: b.image || '',
      mobile_image: b.mobile_image || '',
      link: b.link || '',
      button_text: b.button_text || '',
      sort_order: b.sort_order || 0,
      start_date: b.start_date || '',
      end_date: b.end_date || '',
      status: b.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateBanner(editing.id, form);
      } else {
        await createBanner(form);
      }
      setModalOpen(false);
      fetchBanners();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteBanner(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchBanners();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const toggleStatus = async (banner) => {
    await updateBanner(banner.id, { ...banner, status: !banner.status });
    fetchBanners();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Banners</h1>
          <p className="text-sm text-text-secondary">{banners.length} banners • {banners.filter((b) => b.status).length} active</p>
        </div>
        <PermissionGuard permission="create banners">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Banner
          </AdminButton>
        </PermissionGuard>
      </div>

      {banners.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Image} title="No banners yet" description="Create your first banner to display on the homepage." actionLabel="Add Banner" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <motion.div key={banner.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="w-full h-36 rounded-xl bg-secondary overflow-hidden flex items-center justify-center mb-4">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <Image size={32} className="text-text-secondary" />
                )}
              </div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{banner.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <AdminBadge variant={typeBadge[banner.type] || 'default'} className="text-[10px]">
                      {banner.type}
                    </AdminBadge>
                    <span className="text-xs text-text-secondary">Order: #{banner.sort_order}</span>
                  </div>
                </div>
                <AdminBadge variant={banner.status ? 'success' : 'danger'} className="text-[10px] shrink-0 ml-2">
                  {banner.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              {(banner.start_date || banner.end_date) && (
                <p className="text-[10px] text-text-secondary mt-1">
                  {banner.start_date && `From ${new Date(banner.start_date).toLocaleDateString()}`}
                  {banner.start_date && banner.end_date && ' '}
                  {banner.end_date && `To ${new Date(banner.end_date).toLocaleDateString()}`}
                </p>
              )}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                <button onClick={() => toggleStatus(banner)}
                  className={`p-1.5 rounded-lg transition-colors ${banner.status ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}>
                  {banner.status ? <EyeOff size={14} className="text-warning" /> : <Eye size={14} className="text-success" />}
                </button>
                <PermissionGuard permission="edit banners">
                  <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Edit3 size={14} className="text-text-secondary" />
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete banners">
                  <button onClick={() => setDeleteConfirm(banner)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'} size="lg">
        <div className="space-y-4">
          <AdminInput label="Title" value={form.title} onChange={handleChange('title')} placeholder="Banner title" required />
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect label="Type" value={form.type} onChange={handleChange('type')} options={[
              { value: 'hero', label: 'Hero' },
              { value: 'offer', label: 'Offer' },
              { value: 'category', label: 'Category' },
              { value: 'collection', label: 'Collection' },
              { value: 'popup', label: 'Popup' },
            ]} />
            <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Image URL" value={form.image} onChange={handleChange('image')} placeholder="https://..." />
            <AdminInput label="Mobile Image URL" value={form.mobile_image} onChange={handleChange('mobile_image')} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Link URL" value={form.link} onChange={handleChange('link')} placeholder="https://..." />
            <AdminInput label="Button Text" value={form.button_text} onChange={handleChange('button_text')} placeholder="Shop Now" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Start Date" type="date" value={form.start_date} onChange={handleChange('start_date')} />
            <AdminInput label="End Date" type="date" value={form.end_date} onChange={handleChange('end_date')} />
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
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
