import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image, Eye, EyeOff, Trash2 } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';

const initialBanners = [
  { id: 1, title: 'Summer Collection 2024', subtitle: 'Discover the latest trends', active: true, order: 1 },
  { id: 2, title: 'Resin Art Masterpieces', subtitle: 'Handcrafted with love', active: true, order: 2 },
  { id: 3, title: 'New Accessories', subtitle: 'Complete your look', active: false, order: 3 },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '' });

  const openAdd = () => {
    setForm({ title: '', subtitle: '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    setBanners([...banners, { ...form, id: Date.now(), active: true, order: banners.length + 1 }]);
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setBanners(banners.map((b) => b.id === id ? { ...b, active: !b.active } : b));
  };

  const handleDelete = () => {
    setBanners(banners.filter((b) => b.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Banners</h1>
          <p className="text-sm text-text-secondary">{banners.length} banners • {banners.filter((b) => b.active).length} active</p>
        </div>
        <AdminButton onClick={openAdd}>
          <Plus size={16} />
          Add Banner
        </AdminButton>
      </div>

      {banners.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Image} title="No banners yet" description="Add banners to display on the homepage." actionLabel="Add Banner" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5">
              <div className="w-full h-36 rounded-xl bg-secondary mb-4 flex items-center justify-center">
                <Image size={32} className="text-text-secondary" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{banner.title}</h3>
                  <p className="text-xs text-text-secondary">{banner.subtitle}</p>
                </div>
                <AdminBadge variant={banner.active ? 'success' : 'danger'}>
                  {banner.active ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              <p className="text-xs text-text-secondary">Order: #{banner.order}</p>
              <div className="flex gap-1 mt-3">
                <button onClick={() => toggleActive(banner.id)} className={`p-1.5 rounded-lg transition-colors ${banner.active ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}>
                  {banner.active ? <EyeOff size={14} className="text-warning" /> : <Eye size={14} className="text-success" />}
                </button>
                <button onClick={() => setDeleteConfirm(banner)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-danger" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Banner">
        <div className="space-y-4">
          <div className="w-full h-40 rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary">
            <Image size={24} className="text-text-secondary mb-1" />
            <span className="text-sm text-text-secondary">Click to upload banner image</span>
          </div>
          <AdminInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title" />
          <AdminInput label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner subtitle" />
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave}>Save</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Banner" message={`Delete "${deleteConfirm?.title}"?`} confirmLabel="Delete" />
    </motion.div>
  );
}
