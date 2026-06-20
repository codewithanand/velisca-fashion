import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, FolderTree } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useBlogCategoriesStore from '../../../stores/blogCategories.store';

export default function AdminBlogCategories() {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useBlogCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', status: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', status: true });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug || '', description: c.description || '', status: c.status ?? true });
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
      fetchCategories();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCategory(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Blog Categories</h1>
          <p className="text-sm text-text-secondary">{categories.length} categories</p>
        </div>
        <PermissionGuard permission="manage blogs">
          <AdminButton onClick={openAdd}><Plus size={16} /> Add Category</AdminButton>
        </PermissionGuard>
      </div>

      {categories.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={FolderTree} title="No categories" description="Create your first blog category." actionLabel="Add Category" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Posts</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-medium text-text-primary">{cat.name}</td>
                  <td className="text-sm text-text-secondary">/{cat.slug}</td>
                  <td className="text-sm text-text-secondary">{cat.blogs_count || 0}</td>
                  <td>
                    <AdminBadge variant={cat.status ? 'success' : 'danger'} className="text-[10px]">{cat.status ? 'Active' : 'Inactive'}</AdminBadge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Edit3 size={14} className="text-text-secondary" />
                      </button>
                      <PermissionGuard permission="manage blogs">
                        <button onClick={() => setDeleteConfirm(cat)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <AdminInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" required />
          <AdminInput label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description..." className="admin-input min-h-[60px] resize-y" rows={2} />
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

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteConfirm?.name}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
