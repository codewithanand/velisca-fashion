import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Plus, GripVertical, Eye } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminButton from '../../../components/admin/AdminButton';
import AdminBadge from '../../../components/admin/AdminBadge';
import api from '../../../services/api';
import useProductsStore from '../../../stores/products.store';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { createProduct, updateProduct, fetchProduct } = useProductsStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [form, setForm] = useState({
    name: '', slug: '', category_id: '', brand_id: '',
    short_description: '', description: '',
    price: '', sale_price: '', cost_price: '',
    sku: '', stock: '', low_stock_threshold: 10,
    weight: '', unit: '',
    status: 'draft',
    featured: false, is_new: false, is_trending: false, is_best_seller: false,
    seo_title: '', seo_description: '', seo_keywords: '',
  });

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, brandRes, colorRes, sizeRes, tagRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/brands').catch(() => ({ data: { data: { brands: [] } } })),
          api.get('/admin/colors').catch(() => ({ data: { data: { colors: [] } } })),
          api.get('/admin/sizes').catch(() => ({ data: { data: { sizes: [] } } })),
          api.get('/admin/tags').catch(() => ({ data: { data: { tags: [] } } })),
        ]);
        setCategories(catRes.data?.categories || []);
        setBrands(brandRes.data?.data?.brands || []);
        setColors(colorRes.data?.data?.colors || []);
        setSizes(sizeRes.data?.data?.sizes || []);
        setAllTags(tagRes.data?.data?.tags || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const product = await fetchProduct(id);
          if (product) {
            setForm({
              name: product.name || '',
              slug: product.slug || '',
              category_id: product.category_id || '',
              brand_id: product.brand_id || '',
              short_description: product.short_description || '',
              description: product.description || '',
              price: product.price || '',
              sale_price: product.sale_price || '',
              cost_price: product.cost_price || '',
              sku: product.sku || '',
              stock: product.stock || '',
              low_stock_threshold: product.low_stock_threshold || 10,
              weight: product.weight || '',
              unit: product.unit || '',
              status: product.status || 'draft',
              featured: product.featured || false,
              is_new: product.is_new || false,
              is_trending: product.is_trending || false,
              is_best_seller: product.is_best_seller || false,
              seo_title: product.seo_title || '',
              seo_description: product.seo_description || '',
              seo_keywords: product.seo_keywords || '',
            });
            if (product.images) setImages(product.images);
            if (product.variants) setVariants(product.variants);
            if (product.tags) setSelectedTags(product.tags.map((t) => t.id));
          }
        } catch { /* ignore */ }
      })();
    }
  }, [id, isEdit, fetchProduct]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, {
          id: null, image: ev.target.result, sort_order: prev.length, is_primary: prev.length === 0,
        }]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index) => {
    setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const reorderImage = (from, to) => {
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setImages(reordered.map((img, i) => ({ ...img, sort_order: i })));
  };

  const addVariant = () => {
    setVariants([...variants, {
      id: null, sku: '', color_id: '', size_id: '', price: '', sale_price: '', stock: '', image: '', status: true,
    }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : undefined,
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        stock: Number(form.stock) || 0,
        weight: form.weight ? Number(form.weight) : undefined,
        low_stock_threshold: Number(form.low_stock_threshold) || 10,
        images: images.map((img, i) => ({
          id: img.id,
          image: img.image,
          sort_order: i,
          is_primary: img.is_primary || i === 0,
        })),
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          color_id: v.color_id || undefined,
          size_id: v.size_id || undefined,
          price: v.price ? Number(v.price) : undefined,
          sale_price: v.sale_price ? Number(v.sale_price) : undefined,
          stock: Number(v.stock) || 0,
          status: v.status,
        })),
        tags: selectedTags,
      };

      if (isEdit) {
        await updateProduct(id, data);
      } else {
        await createProduct(data);
      }
      navigate('/admin/products');
    } catch { /* error handling */ }
    setSaving(false);
  };

  const filteredTags = allTags.filter((t) =>
    t.name?.toLowerCase().includes(tagSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-sm text-text-secondary">{isEdit ? 'Update product details' : 'Create a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput label="Product Name" value={form.name} onChange={handleChange('name')} placeholder="Enter product name" required />
            <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="auto-generated" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-text-primary block mb-1.5">Short Description</label>
            <input type="text" value={form.short_description} onChange={handleChange('short_description')} placeholder="Brief product description..." className="admin-input w-full" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-text-primary block mb-1.5">Full Description</label>
            <textarea value={form.description} onChange={handleChange('description')} placeholder="Detailed product description..." rows={6} className="admin-input w-full resize-none" />
          </div>
        </AdminCard>

        {/* Section 2: Product Media */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Product Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl bg-secondary overflow-hidden group border-2 border-transparent hover:border-primary/30 transition-colors">
                <img src={img.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => setPrimary(i)} className={`p-1.5 rounded-full ${img.is_primary ? 'bg-primary text-white' : 'bg-white/80 text-text-secondary'}`} title={img.is_primary ? 'Primary' : 'Set as primary'}>
                    <Eye size={12} />
                  </button>
                  <button type="button" onClick={() => removeImage(i)} className="p-1.5 rounded-full bg-red-500 text-white">
                    <X size={12} />
                  </button>
                </div>
                {img.is_primary && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-medium">Primary</span>}
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer bg-secondary/50">
              <Upload size={20} className="text-text-secondary mb-1" />
              <span className="text-xs text-text-secondary">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </AdminCard>

        {/* Section 3: Pricing */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput label="Price (₹)" type="number" value={form.price} onChange={handleChange('price')} placeholder="0" required />
            <AdminInput label="Sale Price (₹)" type="number" value={form.sale_price} onChange={handleChange('sale_price')} placeholder="0" />
            <AdminInput label="Cost Price (₹)" type="number" value={form.cost_price} onChange={handleChange('cost_price')} placeholder="0" />
          </div>
        </AdminCard>

        {/* Section 4: Inventory */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput label="SKU" value={form.sku} onChange={handleChange('sku')} placeholder="e.g. VLC-001" />
            <AdminInput label="Stock Quantity" type="number" value={form.stock} onChange={handleChange('stock')} placeholder="0" />
            <AdminInput label="Low Stock Threshold" type="number" value={form.low_stock_threshold} onChange={handleChange('low_stock_threshold')} placeholder="10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AdminSelect label="Category" value={form.category_id} onChange={handleChange('category_id')} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select category" />
            <AdminSelect label="Brand" value={form.brand_id} onChange={handleChange('brand_id')} options={brands.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select brand" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AdminInput label="Weight (kg)" type="number" value={form.weight} onChange={handleChange('weight')} placeholder="0" />
            <AdminInput label="Unit" value={form.unit} onChange={handleChange('unit')} placeholder="pcs, kg, etc." />
          </div>
        </AdminCard>

        {/* Section 5: Product Variants */}
        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Product Variants</h3>
            <button type="button" onClick={addVariant} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center bg-secondary/30 rounded-xl">No variants yet. Add color/size combinations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">SKU</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Color</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Size</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Price</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Sale</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Stock</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium">Status</th>
                    <th className="text-left py-2 px-2 text-text-secondary font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5 px-2"><input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="admin-input text-xs py-1 w-20" /></td>
                      <td className="py-1.5 px-2">
                        <select value={v.color_id} onChange={(e) => updateVariant(i, 'color_id', e.target.value)} className="admin-input text-xs py-1 w-24">
                          <option value="">—</option>
                          {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="py-1.5 px-2">
                        <select value={v.size_id} onChange={(e) => updateVariant(i, 'size_id', e.target.value)} className="admin-input text-xs py-1 w-20">
                          <option value="">—</option>
                          {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                      <td className="py-1.5 px-2"><input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="admin-input text-xs py-1 w-20" /></td>
                      <td className="py-1.5 px-2"><input type="number" value={v.sale_price} onChange={(e) => updateVariant(i, 'sale_price', e.target.value)} className="admin-input text-xs py-1 w-20" /></td>
                      <td className="py-1.5 px-2"><input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="admin-input text-xs py-1 w-16" /></td>
                      <td className="py-1.5 px-2">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={v.status} onChange={(e) => updateVariant(i, 'status', e.target.checked)} className="accent-primary" />
                          <span className="text-xs">{v.status ? 'Active' : 'Inactive'}</span>
                        </label>
                      </td>
                      <td className="py-1.5 px-2">
                        <button type="button" onClick={() => removeVariant(i)} className="p-1 rounded hover:bg-red-50 text-danger">
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        {/* Section 6: Product Tags */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Product Tags</h3>
          <input type="text" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} placeholder="Search tags..." className="admin-input w-full mb-3" />
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTags.includes(tag.id) ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </AdminCard>

        {/* Section 7: Product SEO */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">SEO</h3>
          <div className="space-y-4">
            <AdminInput label="SEO Title" value={form.seo_title} onChange={handleChange('seo_title')} placeholder="Meta title for search engines" />
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">SEO Description</label>
              <textarea value={form.seo_description} onChange={handleChange('seo_description')} placeholder="Meta description..." rows={2} className="admin-input w-full resize-none" />
            </div>
            <AdminInput label="SEO Keywords" value={form.seo_keywords} onChange={handleChange('seo_keywords')} placeholder="keyword1, keyword2, keyword3" />
          </div>
        </AdminCard>

        {/* Section 8: Product Status & Flags */}
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Status & Flags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminSelect label="Status" value={form.status} onChange={handleChange('status')} options={statusOptions} />
            <div />
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_new} onChange={handleChange('is_new')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_trending} onChange={handleChange('is_trending')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Trending</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_best_seller} onChange={handleChange('is_best_seller')} className="accent-primary w-4 h-4" />
                <span className="text-sm text-text-primary">Best Seller</span>
              </label>
            </div>
          </div>
        </AdminCard>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <AdminButton variant="ghost" type="button" onClick={() => navigate('/admin/products')}>Cancel</AdminButton>
          <AdminButton type="submit" disabled={saving}>
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? 'Update Product' : 'Save Product'}
          </AdminButton>
        </div>
      </form>
    </motion.div>
  );
}
