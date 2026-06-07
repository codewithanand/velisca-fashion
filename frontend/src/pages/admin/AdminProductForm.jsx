import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Plus, GripVertical } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminInput from '../../components/admin/AdminInput';
import AdminSelect from '../../components/admin/AdminSelect';
import AdminButton from '../../components/admin/AdminButton';

const categories = [
  { value: 'resin-art', label: 'Resin Art' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'accessories', label: 'Accessories' },
];

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount: '',
    tax: '',
    sku: '',
    stock: '',
    category: '',
    metaTitle: '',
    metaDescription: '',
    sizes: [],
    colors: [],
  });

  const [images, setImages] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const addSize = () => {
    if (newSize && !form.sizes.includes(newSize)) {
      setForm({ ...form, sizes: [...form.sizes, newSize] });
      setNewSize('');
    }
  };

  const removeSize = (size) => setForm({ ...form, sizes: form.sizes.filter((s) => s !== size) });

  const addColor = () => {
    if (newColor && !form.colors.includes(newColor)) {
      setForm({ ...form, colors: [...form.colors, newColor] });
      setNewColor('');
    }
  };

  const removeColor = (color) => setForm({ ...form, colors: form.colors.filter((c) => c !== color) });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name }))]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call
    navigate('/admin/products');
  };

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
        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput label="Product Name" value={form.name} onChange={handleChange('name')} placeholder="Enter product name" />
            <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="product-slug" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Enter product description..."
              rows={4}
              className="admin-input resize-none"
            />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput label="Price ($)" type="number" value={form.price} onChange={handleChange('price')} placeholder="0.00" />
            <AdminInput label="Discount (%)" type="number" value={form.discount} onChange={handleChange('discount')} placeholder="0" />
            <AdminInput label="Tax (%)" type="number" value={form.tax} onChange={handleChange('tax')} placeholder="0" />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput label="SKU" value={form.sku} onChange={handleChange('sku')} placeholder="SKU-001" />
            <AdminInput label="Stock" type="number" value={form.stock} onChange={handleChange('stock')} placeholder="0" />
            <AdminSelect label="Category" value={form.category} onChange={handleChange('category')} options={categories} placeholder="Select category" />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Sizes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size"
                  className="admin-input flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button type="button" onClick={addSize} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.sizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-sm text-text-primary">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="text-text-secondary hover:text-danger">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Colors</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add color"
                  className="admin-input flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button type="button" onClick={addColor} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.colors.map((color) => (
                  <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-sm text-text-primary">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="text-text-secondary hover:text-danger">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl bg-secondary overflow-hidden group">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer bg-secondary/50">
              <Upload size={20} className="text-text-secondary mb-1" />
              <span className="text-xs text-text-secondary">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">SEO</h3>
          <div className="space-y-4">
            <AdminInput label="Meta Title" value={form.metaTitle} onChange={handleChange('metaTitle')} placeholder="SEO title" />
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={handleChange('metaDescription')}
                placeholder="SEO description..."
                rows={2}
                className="admin-input resize-none"
              />
            </div>
          </div>
        </AdminCard>

        <div className="flex items-center justify-end gap-3 pb-8">
          <AdminButton variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</AdminButton>
          <AdminButton type="submit">
            <Save size={16} />
            {isEdit ? 'Update Product' : 'Save Product'}
          </AdminButton>
        </div>
      </form>
    </motion.div>
  );
}
