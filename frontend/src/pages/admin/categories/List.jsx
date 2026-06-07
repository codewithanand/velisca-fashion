import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Image, Star, StarOff, FolderTree } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminBadge from '../../../components/admin/AdminBadge';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useCategoriesStore from '../../../stores/categories.store';

export default function AdminCategories() {
  const navigate = useNavigate();
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', parent_id: '', description: '', image: '', banner: '',
    status: true, featured: false, sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories({ parents_only: false }); }, [fetchCategories]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', parent_id: '', description: '', image: '', banner: '', status: true, featured: false, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      parent_id: cat.parent_id || '',
      description: cat.description || '',
      image: cat.image || '',
      banner: cat.banner || '',
      status: cat.status ?? true,
      featured: cat.featured || false,
      sort_order: cat.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }
      setModalOpen(false);
      fetchCategories({ parents_only: false });
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCategory(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchCategories({ parents_only: false });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Categories</h1>
          <p className="text-sm text-text-secondary">{categories.length} categories</p>
        </div>
        <PermissionGuard permission="create categories">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Category
          </AdminButton>
        </PermissionGuard>
      </div>

      {categories.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Image} title="No categories yet" description="Create your first category to organize products." actionLabel="Add Category" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div key={cat.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FolderTree size={20} className="text-text-secondary" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {cat.featured && <Star size={14} className="text-warning fill-warning" />}
                  <AdminBadge variant={cat.status ? 'success' : 'danger'} className="text-[10px]">
                    {cat.status ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{cat.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">/{cat.slug}</p>
              {cat.parent && <p className="text-xs text-text-secondary mt-1">Parent: {cat.parent.name}</p>}
              <p className="text-xs text-text-secondary mt-2">
                <span className="font-medium">{cat.products_count || 0}</span> products
                {cat.children_count > 0 && <span className="ml-2"><span className="font-medium">{cat.children_count}</span> subcategories</span>}
              </p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit categories">
                  <button onClick={() => openEdit(cat)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete categories">
                  <button onClick={() => setDeleteConfirm(cat)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Category Name" value={form.name} onChange={handleChange('name')} placeholder="Enter category name" required />
            <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="auto-generated" />
          </div>
          <AdminSelect label="Parent Category" value={form.parent_id} onChange={handleChange('parent_id')} options={[
            { value: '', label: 'None (Top Level)' },
            ...categories.filter((c) => c.id !== editing?.id).map((c) => ({ value: c.id, label: c.name })),
          ]} />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
            <textarea value={form.description} onChange={handleChange('description')} placeholder="Category description..." rows={3} className="admin-input w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Image URL" value={form.image} onChange={handleChange('image')} placeholder="https://..." />
            <AdminInput label="Banner URL" value={form.banner} onChange={handleChange('banner')} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" />
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Featured</span>
              </label>
            </div>
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
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? Products in this category will not be deleted but will become uncategorized.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
