import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Star, Package } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { adminCollectionService } from '../../../services/admin/adminService';

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', collection_type: 'manual', banner: '', status: true, seo_title: '', seo_description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminCollectionService.getAll();
      setCollections(res.data?.collections?.data || res.data?.collections || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', collection_type: 'manual', banner: '', status: true, seo_title: '', seo_description: '' });
    setModalOpen(true);
  };

  const openEdit = (col) => {
    setEditing(col);
    setForm({ name: col.name, slug: col.slug, description: col.description || '', collection_type: col.collection_type || 'manual', banner: col.banner || '', status: col.status ?? true, seo_title: col.seo_title || '', seo_description: col.seo_description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await adminCollectionService.update(editing.id, form);
      } else {
        await adminCollectionService.create(form);
      }
      setModalOpen(false);
      load();
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    await adminCollectionService.delete(deleteConfirm.id);
    setDeleteConfirm(null);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Collections</h1>
          <p className="text-sm text-text-secondary">{collections.length} collections</p>
        </div>
        <PermissionGuard permission="edit products">
          <AdminButton onClick={openAdd}><Plus size={16} /> Add Collection</AdminButton>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Star} title="No collections yet" description="Create product collections for your store." actionLabel="Add Collection" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <motion.div key={col.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Star size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={col.status ? 'success' : 'danger'}>{col.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{col.name}</h3>
              <p className="text-xs text-text-secondary">/{col.slug}</p>
              {col.description && <p className="text-xs text-text-secondary mt-2 line-clamp-2">{col.description}</p>}
              <p className="text-xs text-text-secondary mt-2">
                <span className="font-medium">{col.products_count || 0}</span> products
              </p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(col)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium">
                  <Edit3 size={12} className="inline mr-1" /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(col)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium">
                  <Trash2 size={12} className="inline mr-1" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Collection' : 'Add Collection'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Collection Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter name" />
            <AdminInput label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
          </div>
          <AdminSelect label="Collection Type" value={form.collection_type} onChange={(e) => setForm({ ...form, collection_type: e.target.value })} options={[
            { value: 'manual', label: 'Manual Collection' },
            { value: 'automatic', label: 'Automatic Collection' },
            { value: 'campaign', label: 'Campaign Collection' },
            { value: 'seasonal', label: 'Seasonal Collection' },
          ]} />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Collection description..." rows={3} className="admin-input w-full resize-none" />
          </div>
          <AdminInput label="Banner Image URL" value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} placeholder="https://..." />
          <AdminInput label="SEO Title" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="SEO title" />
          <AdminInput label="SEO Description" value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder="SEO description" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave}>{editing ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Collection" message={`Delete "${deleteConfirm?.name}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
