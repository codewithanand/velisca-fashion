import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import AdminCard from '../../../components/admin/AdminCard';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminButton from '../../../components/admin/AdminButton';
import useBlogsStore from '../../../stores/blogs.store';
import useBlogCategoriesStore from '../../../stores/blogCategories.store';

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBlog, createBlog, updateBlog } = useBlogsStore();
  const { categories, fetchCategories } = useBlogCategoriesStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', category_id: '', excerpt: '', content: '',
    featured_image: '', author_id: '', is_featured: false,
    status: 'draft', published_at: '',
    seo_title: '', seo_description: '', seo_keywords: '',
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchBlog(id).then((data) => {
        if (data) {
          setForm({
            title: data.title || '', slug: data.slug || '', category_id: data.category_id || '',
            excerpt: data.excerpt || '', content: data.content || '',
            featured_image: data.featured_image || '', author_id: data.author_id || '',
            is_featured: data.is_featured || false, status: data.status || 'draft',
            published_at: data.published_at ? data.published_at.slice(0, 16) : '',
            seo_title: data.seo_title || '', seo_description: data.seo_description || '',
            seo_keywords: data.seo_keywords || '',
          });
        }
      });
    }
  }, [id, fetchBlog, fetchCategories]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await updateBlog(id, form);
      } else {
        await createBlog(form);
      }
      navigate('/admin/blogs');
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{id ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
          <p className="text-sm text-text-secondary">{id ? 'Update your blog post' : 'Write a new blog post'}</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="ghost" onClick={() => navigate('/admin/blogs')}>Cancel</AdminButton>
          <AdminButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : id ? 'Update Post' : 'Create Post'}
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Blog Content">
            <div className="space-y-4">
              <AdminInput label="Title" value={form.title} onChange={handleChange('title')} placeholder="Post title" required />
              <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="post-url-slug" />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Excerpt</label>
                <textarea value={form.excerpt} onChange={handleChange('excerpt')} placeholder="Brief summary..." className="admin-input min-h-[60px] resize-y" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Content (HTML)</label>
                <textarea value={form.content} onChange={handleChange('content')} placeholder="<h2>Post content...</h2>" className="admin-input min-h-[300px] resize-y font-mono text-sm" rows={15} />
                <p className="text-xs text-text-secondary mt-1">Supports HTML content.</p>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Publishing">
            <div className="space-y-4">
              <AdminSelect label="Status" value={form.status} onChange={handleChange('status')} options={[
                { value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' },
              ]} />
              <AdminInput label="Published At" type="datetime-local" value={form.published_at} onChange={handleChange('published_at')} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={handleChange('is_featured')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Featured post</span>
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Organization">
            <div className="space-y-4">
              <AdminSelect label="Category" value={form.category_id} onChange={handleChange('category_id')} options={[
                { value: '', label: 'No category' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]} />
              <AdminInput label="Author ID" value={form.author_id} onChange={handleChange('author_id')} placeholder="Author name/ID" />
            </div>
          </AdminCard>

          <AdminCard title="Media">
            <AdminInput label="Featured Image URL" value={form.featured_image} onChange={handleChange('featured_image')} placeholder="https://..." />
          </AdminCard>

          <AdminCard title="SEO">
            <div className="space-y-4">
              <AdminInput label="SEO Title" value={form.seo_title} onChange={handleChange('seo_title')} placeholder="Meta title" />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">SEO Description</label>
                <textarea value={form.seo_description} onChange={handleChange('seo_description')} placeholder="Meta description..." className="admin-input min-h-[60px] resize-y" rows={2} />
              </div>
              <AdminInput label="SEO Keywords" value={form.seo_keywords} onChange={handleChange('seo_keywords')} placeholder="keyword1, keyword2" />
            </div>
          </AdminCard>
        </div>
      </div>
    </motion.div>
  );
}
