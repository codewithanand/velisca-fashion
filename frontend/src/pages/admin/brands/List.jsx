import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Globe, Search, Star, StarOff } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useBrandsStore from '../../../stores/brands.store';

export default function AdminBrands() {
  const { brands, loading, fetchBrands, createBrand, updateBrand, deleteBrand } = useBrandsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', slug: '', description: '', logo: '', banner: '', website: '',
    featured: false, sort_order: 0, status: true,
    seo_title: '', seo_description: '', seo_keywords: '',
  });
  const [saving, setSaving] = useState(false);
  const { errors, validate, clearErrors, clearField } = useFormValidation({
    name: [{ required: true }, { minLength: 2 }],
    website: [{ url: true }],
    logo: [{ url: true }],
    banner: [{ url: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
    seo_title: [{ maxLength: 70 }],
    seo_description: [{ maxLength: 160 }],
  });

  useEffect(() => { fetchBrands(search ? { search } : undefined); }, [search, fetchBrands]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', slug: '', description: '', logo: '', banner: '', website: '',
      featured: false, sort_order: 0, status: true,
      seo_title: '', seo_description: '', seo_keywords: '',
    });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name || '',
      slug: b.slug || '',
      description: b.description || '',
      logo: b.logo || '',
      banner: b.banner || '',
      website: b.website || '',
      featured: b.featured ?? false,
      sort_order: b.sort_order ?? 0,
      status: b.status ?? true,
      seo_title: b.seo_title || '',
      seo_description: b.seo_description || '',
      seo_keywords: b.seo_keywords || '',
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateBrand(editing.id, form);
      } else {
        await createBrand(form);
      }
      setModalOpen(false);
      fetchBrands(search ? { search } : undefined);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteBrand(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchBrands(search ? { search } : undefined);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearField(field);
  };

  const toggleFeatured = async (brand) => {
    await updateBrand(brand.id, { featured: !brand.featured });
    fetchBrands(search ? { search } : undefined);
  };

  const toggleStatus = async (brand) => {
    await updateBrand(brand.id, { status: !brand.status });
    fetchBrands(search ? { search } : undefined);
  };

  const filtered = brands.filter((b) =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Brands</h1>
          <p className="text-sm text-text-secondary">{brands.length} brands</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" placeholder="Search brands..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-48 text-sm" />
          </div>
          <PermissionGuard permission="manage brands">
            <AdminButton onClick={openAdd}><Plus size={16} /> Add Brand</AdminButton>
          </PermissionGuard>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Globe} title={search ? 'No brands match your search' : 'No brands yet'}
            description={search ? 'Try a different search term.' : 'Create your first brand.'}
            actionLabel="Add Brand" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Brand Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand.id} className="admin-table-row">
                  <td>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Globe size={16} className="text-text-secondary" />
                      </div>
                    )}
                  </td>
                  <td className="text-sm font-medium text-text-primary">{brand.name}</td>
                  <td className="text-sm text-text-secondary">{brand.slug}</td>
                  <td className="text-sm text-text-secondary">{brand.products_count ?? '-'}</td>
                  <td>
                    <button onClick={() => toggleFeatured(brand)}
                      className={`p-1 rounded-lg transition-colors ${brand.featured ? 'text-amber-500' : 'text-text-secondary hover:text-amber-500'}`}>
                      {brand.featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => toggleStatus(brand)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        brand.status ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                      }`}>
                      {brand.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="text-sm text-text-secondary">{new Date(brand.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="manage brands">
                        <button onClick={() => openEdit(brand)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Edit3 size={14} className="text-text-secondary" />
                        </button>
                        <button onClick={() => setDeleteConfirm(brand)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Brand' : 'Add Brand'} size="xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Brand Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. House of Pixels" required error={errors.name} />
              <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="Auto-generated from name" error={errors.slug} />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
              <textarea value={form.description} onChange={handleChange('description')}
                placeholder="Brand description..." rows={3} className="admin-input w-full resize-none" />
            </div>
            <AdminInput label="Website URL" value={form.website} onChange={handleChange('website')} placeholder="https://example.com" error={errors.website} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Brand Logo URL" value={form.logo} onChange={handleChange('logo')} placeholder="https://..." error={errors.logo} />
              <AdminInput label="Brand Banner URL" value={form.banner} onChange={handleChange('banner')} placeholder="https://..." error={errors.banner} />
            </div>
            {(form.logo || form.banner) && (
              <div className="flex gap-4 mt-3">
                {form.logo && (
                  <div className="text-center">
                    <p className="text-[10px] text-text-secondary mb-1">Logo Preview</p>
                    <img src={form.logo} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover border border-border/30" />
                  </div>
                )}
                {form.banner && (
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-text-secondary mb-1">Banner Preview</p>
                    <img src={form.banner} alt="Banner preview" className="h-16 w-full rounded-lg object-cover border border-border/30" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" error={errors.sort_order} />
              <div className="flex items-end pb-2 gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="accent-primary w-4 h-4" />
                  <span className="text-sm text-text-primary">Featured Brand</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
                  <span className="text-sm text-text-primary">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">SEO</h3>
            <div className="space-y-4">
              <AdminInput label="SEO Title" value={form.seo_title} onChange={handleChange('seo_title')} placeholder="Meta title" error={errors.seo_title} />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">SEO Description</label>
                <textarea value={form.seo_description} onChange={handleChange('seo_description')}
                  placeholder="Meta description..." rows={2} className="admin-input w-full resize-none" />
              </div>
              <AdminInput label="SEO Keywords" value={form.seo_keywords} onChange={handleChange('seo_keywords')} placeholder="fashion, luxury, brand" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Brand' : 'Create Brand'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
