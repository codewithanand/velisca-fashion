import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Image } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';
import AdminInput from '../../components/admin/AdminInput';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const initialCategories = [
  { id: 1, name: 'Resin Art', slug: 'resin-art', count: 45, image: '' },
  { id: 2, name: 'Fashion', slug: 'fashion', count: 128, image: '' },
  { id: 3, name: 'Accessories', slug: 'accessories', count: 67, image: '' },
  { id: 4, name: 'Home Decor', slug: 'home-decor', count: 34, image: '' },
  { id: 5, name: 'Jewelry', slug: 'jewelry', count: 89, image: '' },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setCategories(categories.map((c) => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCategories([...categories, { ...form, id: Date.now(), count: 0, image: '' }]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setCategories(categories.filter((c) => c.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Categories</h1>
          <p className="text-sm text-text-secondary">{categories.length} categories</p>
        </div>
        <AdminButton onClick={openAdd}>
          <Plus size={16} />
          Add Category
        </AdminButton>
      </div>

      {categories.length === 0 ? (
        <AdminCard>
          <AdminEmptyState
            icon={Image}
            title="No categories yet"
            description="Create your first category to organize products."
            actionLabel="Add Category"
            onAction={openAdd}
          />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-card p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Image size={20} className="text-text-secondary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-secondary">
                    <Edit3 size={14} className="text-text-secondary" />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{cat.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">/{cat.slug}</p>
              <p className="text-xs text-text-secondary mt-2">{cat.count} products</p>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <AdminInput label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter category name" />
          <AdminInput label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" />
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave}>{editing ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? Products in this category will not be deleted.`}
        confirmLabel="Delete"
      />
    </motion.div>
  );
}
