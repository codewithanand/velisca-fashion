import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import AdminCard from '../../../components/admin/AdminCard';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminButton from '../../../components/admin/AdminButton';
import useCmsPagesStore from '../../../stores/cmsPages.store';

export default function AdminCmsPageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPage, createPage, updatePage } = useCmsPagesStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    page_type: 'static',
    excerpt: '',
    content: '',
    banner: '',
    og_image: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    status: 'draft',
    published_at: '',
  });

  useEffect(() => {
    if (id) {
      fetchPage(id).then((data) => {
        if (data) {
          setForm({
            title: data.title || '',
            slug: data.slug || '',
            page_type: data.page_type || 'static',
            excerpt: data.excerpt || '',
            content: data.content || '',
            banner: data.banner || '',
            og_image: data.og_image || '',
            seo_title: data.seo_title || '',
            seo_description: data.seo_description || '',
            seo_keywords: data.seo_keywords || '',
            canonical_url: data.canonical_url || '',
            status: data.status || 'draft',
            published_at: data.published_at ? data.published_at.slice(0, 16) : '',
          });
        }
      });
    }
  }, [id, fetchPage]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await updatePage(id, form);
      } else {
        await createPage(form);
      }
      navigate('/admin/cms-pages');
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{id ? 'Edit CMS Page' : 'Create CMS Page'}</h1>
          <p className="text-sm text-text-secondary">{id ? 'Update page content and settings' : 'Add a new page to your storefront'}</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="ghost" onClick={() => navigate('/admin/cms-pages')}>Cancel</AdminButton>
          <AdminButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : id ? 'Update Page' : 'Create Page'}
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Basic Information">
            <div className="space-y-4">
              <AdminInput label="Page Title" value={form.title} onChange={handleChange('title')} placeholder="Enter page title" required />
              <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="page-url-slug" />
              <div className="grid grid-cols-2 gap-4">
                <AdminSelect label="Page Type" value={form.page_type} onChange={handleChange('page_type')} options={[
                  { value: 'static', label: 'Static Page' },
                  { value: 'landing', label: 'Landing Page' },
                  { value: 'marketing', label: 'Marketing Page' },
                  { value: 'seo', label: 'SEO Page' },
                  { value: 'policy', label: 'Policy Page' },
                ]} />
                <AdminSelect label="Status" value={form.status} onChange={handleChange('status')} options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'scheduled', label: 'Scheduled' },
                ]} />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={handleChange('excerpt')}
                  placeholder="Brief description of the page..."
                  className="admin-input min-h-[80px] resize-y"
                  rows={3}
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Content">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Page Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={handleChange('content')}
                placeholder="<h1>Your content here...</h1>"
                className="admin-input min-h-[300px] resize-y font-mono text-sm"
                rows={15}
              />
              <p className="text-xs text-text-secondary mt-1">Supports HTML content. Rich text editor integration available.</p>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Media">
            <div className="space-y-4">
              <AdminInput label="Banner Image URL" value={form.banner} onChange={handleChange('banner')} placeholder="https://..." />
              <AdminInput label="OG Image URL" value={form.og_image} onChange={handleChange('og_image')} placeholder="https://..." />
            </div>
          </AdminCard>

          <AdminCard title="SEO">
            <div className="space-y-4">
              <AdminInput label="SEO Title" value={form.seo_title} onChange={handleChange('seo_title')} placeholder="Meta title" />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">SEO Description</label>
                <textarea
                  value={form.seo_description}
                  onChange={handleChange('seo_description')}
                  placeholder="Meta description..."
                  className="admin-input min-h-[60px] resize-y"
                  rows={2}
                />
              </div>
              <AdminInput label="SEO Keywords" value={form.seo_keywords} onChange={handleChange('seo_keywords')} placeholder="keyword1, keyword2" />
              <AdminInput label="Canonical URL" value={form.canonical_url} onChange={handleChange('canonical_url')} placeholder="https://..." />
            </div>
          </AdminCard>

          <AdminCard title="Publishing">
            <div className="space-y-4">
              <AdminInput label="Published At" type="datetime-local" value={form.published_at} onChange={handleChange('published_at')} />
            </div>
          </AdminCard>
        </div>
      </div>
    </motion.div>
  );
}
