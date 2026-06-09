import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Palette, Search } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useColorsStore from '../../../stores/colors.store';

const colorFamilies = [
  { value: 'Red', label: 'Red' },
  { value: 'Pink', label: 'Pink' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Green', label: 'Green' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Pastel', label: 'Pastel' },
  { value: 'Metallic', label: 'Metallic' },
  { value: 'Earth Tone', label: 'Earth Tone' },
  { value: 'Purple', label: 'Purple' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Black & White', label: 'Black & White' },
];

export default function AdminColors() {
  const { colors, loading, fetchColors, createColor, updateColor, deleteColor } = useColorsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', slug: '', hex_code: '#E6A8D7', color_family: '', sort_order: 0, status: true,
  });
  const [saving, setSaving] = useState(false);
  const { errors, validate, clearErrors, clearField } = useFormValidation({
    name: [{ required: true }, { minLength: 2 }],
    hex_code: [{ required: true }, { hex: true }],
    color_family: [{ required: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
  });

  useEffect(() => { fetchColors(); }, [fetchColors]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', hex_code: '#E6A8D7', color_family: '', sort_order: 0, status: true });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      hex_code: c.hex_code || '#E6A8D7',
      color_family: c.color_family || '',
      sort_order: c.sort_order ?? 0,
      status: c.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateColor(editing.id, form);
      } else {
        await createColor(form);
      }
      setModalOpen(false);
      fetchColors();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteColor(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchColors();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearField(field);
  };

  const toggleStatus = async (color) => {
    await updateColor(color.id, { status: !color.status });
    fetchColors();
  };

  const filtered = colors.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.color_family?.toLowerCase().includes(search.toLowerCase()) ||
    c.hex_code?.toLowerCase().includes(search.toLowerCase())
  );

  const getTextColor = (hex) => {
    if (!hex) return '#000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#000' : '#fff';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Colors</h1>
          <p className="text-sm text-text-secondary">{colors.length} colors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" placeholder="Search colors..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-48 text-sm" />
          </div>
          <PermissionGuard permission="manage colors">
            <AdminButton onClick={openAdd}><Plus size={16} /> Add Color</AdminButton>
          </PermissionGuard>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Palette} title={search ? 'No colors match your search' : 'No colors yet'}
            description={search ? 'Try a different search term.' : 'Create your first color.'}
            actionLabel="Add Color" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Swatch</th>
                <th>Color Name</th>
                <th>Hex Code</th>
                <th>Color Family</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((color) => (
                <tr key={color.id} className="admin-table-row">
                  <td>
                    <div className="w-9 h-9 rounded-lg border-2 border-border/30 shadow-sm"
                      style={{ backgroundColor: color.hex_code || '#ccc' }} />
                  </td>
                  <td className="text-sm font-medium text-text-primary">{color.name}</td>
                  <td>
                    <code className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-text-secondary">
                      {color.hex_code || '-'}
                    </code>
                  </td>
                  <td>
                    {color.color_family ? (
                      <AdminBadge variant="info" className="text-[10px]">{color.color_family}</AdminBadge>
                    ) : (
                      <span className="text-sm text-text-secondary">-</span>
                    )}
                  </td>
                  <td className="text-sm text-text-secondary">{color.sort_order ?? 0}</td>
                  <td>
                    <button onClick={() => toggleStatus(color)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        color.status ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                      }`}>
                      {color.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="manage colors">
                        <button onClick={() => openEdit(color)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Edit3 size={14} className="text-text-secondary" />
                        </button>
                        <button onClick={() => setDeleteConfirm(color)}
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
        title={editing ? 'Edit Color' : 'Add Color'} size="lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Color Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Rose Gold" required error={errors.name} />
              <AdminInput label="Slug" value={form.slug} onChange={handleChange('slug')} placeholder="Auto-generated" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AdminInput label="Hex Code" value={form.hex_code} onChange={handleChange('hex_code')} placeholder="#E6A8D7" required error={errors.hex_code} />
              <AdminSelect label="Color Family" value={form.color_family} onChange={handleChange('color_family')} options={colorFamilies} error={errors.color_family} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Preview</h3>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border/30"
              style={{ backgroundColor: form.hex_code || '#fff' }}>
              <div className="w-16 h-16 rounded-xl border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: form.hex_code || '#ccc' }} />
              <div style={{ color: getTextColor(form.hex_code) }}>
                <p className="text-sm font-semibold">{form.name || 'Color Name'}</p>
                <p className="text-xs opacity-80">{form.hex_code || '#E6A8D7'} • {form.color_family || 'No family'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} placeholder="0" error={errors.sort_order} />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
                  <span className="text-sm text-text-primary">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Color' : 'Create Color'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Color"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
