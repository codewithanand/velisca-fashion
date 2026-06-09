import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Globe, Link2 } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useSeoStore from '../../../stores/seo.store';
import useFormValidation from '../../../hooks/useFormValidation';

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminSeo() {
  const { pages, redirects, loading, fetchPages, fetchRedirects, createSeoPage, updateSeoPage, deleteSeoPage, createRedirect, updateRedirect, deleteRedirect } = useSeoStore();
  const [tab, setTab] = useState('pages');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    page_type: 'page', page_reference_id: '', meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: '',
  });
  const [redirectForm, setRedirectForm] = useState({
    source_url: '', destination_url: '', redirect_type: '301',
  });
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState(null);
  const [deleteRedirectConfirm, setDeleteRedirectConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const seoRules = {
    meta_title: [{ required: true }],
    meta_description: [{ maxLength: 160 }],
    meta_keywords: [{ minLength: 2 }],
  };
  const redirectRules = {
    source_url: [{ required: true }, { url: true }],
    destination_url: [{ required: true }, { url: true }],
    redirect_type: [{ numeric: true }],
  };
  const { errors: seoErrors, validate: validateSeo, clearErrors: clearSeoErrors, clearField: clearSeoField } = useFormValidation(seoRules);
  const { errors: redirectErrors, validate: validateRedirect, clearErrors: clearRedirectErrors, clearField: clearRedirectField } = useFormValidation(redirectRules);

  useEffect(() => { fetchPages(); fetchRedirects(); }, [fetchPages, fetchRedirects]);

  const openAdd = () => {
    clearSeoErrors();
    setEditing(null);
    setForm({ page_type: 'page', page_reference_id: '', meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: '' });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    clearSeoErrors();
    setEditing(p);
    setForm({
      page_type: p.page_type || 'page',
      page_reference_id: p.page_reference_id || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      meta_keywords: p.meta_keywords || '',
      og_image: p.og_image || '',
      canonical_url: p.canonical_url || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateSeo(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateSeoPage(editing.id, form);
      } else {
        await createSeoPage(form);
      }
      setModalOpen(false);
      fetchPages();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteSeoPage(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchPages();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearSeoField(field);
  };

  const openAddRedirect = () => {
    clearRedirectErrors();
    setEditingRedirect(null);
    setRedirectForm({ source_url: '', destination_url: '', redirect_type: '301' });
    setRedirectModalOpen(true);
  };

  const openEditRedirect = (r) => {
    clearRedirectErrors();
    setEditingRedirect(r);
    setRedirectForm({
      source_url: r.source_url || '',
      destination_url: r.destination_url || '',
      redirect_type: r.redirect_type || '301',
    });
    setRedirectModalOpen(true);
  };

  const handleSaveRedirect = async () => {
    if (!validateRedirect(redirectForm)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editingRedirect) {
        await updateRedirect(editingRedirect.id, redirectForm);
      } else {
        await createRedirect(redirectForm);
      }
      setRedirectModalOpen(false);
      fetchRedirects();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteRedirect = async () => {
    await deleteRedirect(deleteRedirectConfirm.id);
    setDeleteRedirectConfirm(null);
    fetchRedirects();
  };

  const handleRedirectChange = (field) => (e) => {
    setRedirectForm({ ...redirectForm, [field]: e.target.value });
    clearRedirectField(field);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">SEO Manager</h1>
      </div>

      <div className="flex gap-2">
        {[{ key: 'pages', label: 'SEO Pages' }, { key: 'redirects', label: 'Redirects' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pages' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{pages.length} SEO pages</p>
            <PermissionGuard permission="create seo pages">
              <AdminButton onClick={openAdd}>
                <Plus size={16} /> Add SEO Page
              </AdminButton>
            </PermissionGuard>
          </div>

          {pages.length === 0 && !loading ? (
            <AdminCard>
              <AdminEmptyState icon={Globe} title="No SEO pages yet" description="Create your first SEO page entry." actionLabel="Add SEO Page" onAction={openAdd} />
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Globe size={20} className="text-text-secondary" />
                    </div>
                    <AdminBadge variant="info" className="text-[10px]">{p.page_type}</AdminBadge>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {p.meta_title ? (p.meta_title.length > 40 ? p.meta_title.slice(0, 40) + '...' : p.meta_title) : 'Untitled'}
                  </h3>
                  {p.canonical_url && <p className="text-xs text-text-secondary mt-1 truncate">{p.canonical_url}</p>}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PermissionGuard permission="edit seo pages">
                      <button onClick={() => openEdit(p)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                        <Edit3 size={12} className="inline mr-1" /> Edit
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete seo pages">
                      <button onClick={() => setDeleteConfirm(p)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                        <Trash2 size={12} className="inline mr-1" /> Delete
                      </button>
                    </PermissionGuard>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit SEO Page' : 'Add SEO Page'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <AdminSelect label="Page Type" value={form.page_type} onChange={handleChange('page_type')} options={[
                  { value: 'product', label: 'Product' },
                  { value: 'category', label: 'Category' },
                  { value: 'brand', label: 'Brand' },
                  { value: 'collection', label: 'Collection' },
                  { value: 'page', label: 'Page' },
                ]} />
                <AdminInput label="Page Reference ID" type="number" value={form.page_reference_id} onChange={handleChange('page_reference_id')} placeholder="Optional" />
              </div>
              <AdminInput label="Meta Title" value={form.meta_title} onChange={handleChange('meta_title')} placeholder="SEO title" error={seoErrors.meta_title} />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Meta Description</label>
                <textarea value={form.meta_description} onChange={handleChange('meta_description')} placeholder="Meta description..." rows={3} className={`admin-input w-full resize-none ${seoErrors.meta_description ? 'border-danger' : ''}`} />
                {seoErrors.meta_description && <span className="text-xs text-danger">{seoErrors.meta_description}</span>}
              </div>
              <AdminInput label="Meta Keywords" value={form.meta_keywords} onChange={handleChange('meta_keywords')} placeholder="keyword1, keyword2" error={seoErrors.meta_keywords} />
              <AdminInput label="OG Image URL" value={form.og_image} onChange={handleChange('og_image')} placeholder="https://..." />
              <AdminInput label="Canonical URL" value={form.canonical_url} onChange={handleChange('canonical_url')} placeholder="https://..." />
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
            title="Delete SEO Page"
            message={`Are you sure you want to delete this SEO page?`}
            confirmLabel="Delete"
            variant="danger"
          />
        </>
      )}

      {tab === 'redirects' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{redirects.length} redirects</p>
            <PermissionGuard permission="create redirects">
              <AdminButton onClick={openAddRedirect}>
                <Plus size={16} /> Add Redirect
              </AdminButton>
            </PermissionGuard>
          </div>

          {redirects.length === 0 && !loading ? (
            <AdminCard>
              <AdminEmptyState icon={Link2} title="No redirects yet" description="Create your first URL redirect." actionLabel="Add Redirect" onAction={openAddRedirect} />
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {redirects.map((r) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Link2 size={20} className="text-text-secondary" />
                    </div>
                    <AdminBadge variant={r.redirect_type === '301' ? 'primary' : 'warning'} className="text-[10px]">
                      {r.redirect_type}
                    </AdminBadge>
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{r.source_url}</p>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">→ {r.destination_url}</p>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PermissionGuard permission="edit redirects">
                      <button onClick={() => openEditRedirect(r)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                        <Edit3 size={12} className="inline mr-1" /> Edit
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete redirects">
                      <button onClick={() => setDeleteRedirectConfirm(r)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                        <Trash2 size={12} className="inline mr-1" /> Delete
                      </button>
                    </PermissionGuard>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AdminModal isOpen={redirectModalOpen} onClose={() => setRedirectModalOpen(false)} title={editingRedirect ? 'Edit Redirect' : 'Add Redirect'} size="md">
            <div className="space-y-4">
              <AdminInput label="Source URL" value={redirectForm.source_url} onChange={handleRedirectChange('source_url')} placeholder="/old-page" required error={redirectErrors.source_url} />
              <AdminInput label="Destination URL" value={redirectForm.destination_url} onChange={handleRedirectChange('destination_url')} placeholder="/new-page" required error={redirectErrors.destination_url} />
              <AdminSelect label="Redirect Type" value={redirectForm.redirect_type} onChange={handleRedirectChange('redirect_type')} error={redirectErrors.redirect_type} options={[
                { value: '301', label: '301 (Permanent)' },
                { value: '302', label: '302 (Temporary)' },
              ]} />
              <div className="flex justify-end gap-3 pt-2">
                <AdminButton variant="ghost" onClick={() => setRedirectModalOpen(false)}>Cancel</AdminButton>
                <AdminButton onClick={handleSaveRedirect} disabled={saving}>
                  {saving ? 'Saving...' : editingRedirect ? 'Update' : 'Create'}
                </AdminButton>
              </div>
            </div>
          </AdminModal>

          <AdminConfirmDialog
            isOpen={!!deleteRedirectConfirm}
            onClose={() => setDeleteRedirectConfirm(null)}
            onConfirm={handleDeleteRedirect}
            title="Delete Redirect"
            message={`Are you sure you want to delete this redirect?`}
            confirmLabel="Delete"
            variant="danger"
          />
        </>
      )}
    </motion.div>
  );
}
