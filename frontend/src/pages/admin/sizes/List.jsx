import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Ruler, Search } from 'lucide-react';
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
import useSizesStore from '../../../stores/sizes.store';

const sizeGroups = [
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Jewelry', label: 'Jewelry' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Custom', label: 'Custom' },
];

export default function AdminSizes() {
  const { sizes, loading, fetchSizes, createSize, updateSize, deleteSize } = useSizesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', international_size: '', size_group: 'Clothing',
    chest: '', waist: '', hips: '', length: '',
    sort_order: 0, status: true,
  });
  const [saving, setSaving] = useState(false);
  const { errors, validate, clearErrors, clearField } = useFormValidation({
    name: [{ required: true }],
    code: [{ required: true }],
    size_group: [{ required: true }],
    chest: [{ numeric: true }, { min: 0 }],
    waist: [{ numeric: true }, { min: 0 }],
    hips: [{ numeric: true }, { min: 0 }],
    length: [{ numeric: true }, { min: 0 }],
    sort_order: [{ numeric: true }, { min: 0 }],
  });

  useEffect(() => { fetchSizes(); }, [fetchSizes]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', code: '', international_size: '', size_group: 'Clothing',
      chest: '', waist: '', hips: '', length: '',
      sort_order: 0, status: true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      code: s.code || '',
      international_size: s.international_size || '',
      size_group: s.size_group || s.category || 'Clothing',
      chest: s.chest || '',
      waist: s.waist || '',
      hips: s.hips || '',
      length: s.length || '',
      sort_order: s.sort_order ?? 0,
      status: s.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateSize(editing.id, form);
      } else {
        await createSize(form);
      }
      setModalOpen(false);
      fetchSizes();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteSize(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchSizes();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearField(field);
  };

  const toggleStatus = async (size) => {
    await updateSize(size.id, { status: !size.status });
    fetchSizes();
  };

  const filtered = sizes.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.size_group?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sizes</h1>
          <p className="text-sm text-text-secondary">{sizes.length} sizes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" placeholder="Search sizes..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-48 text-sm" />
          </div>
          <PermissionGuard permission="manage sizes">
            <AdminButton onClick={openAdd}><Plus size={16} /> Add Size</AdminButton>
          </PermissionGuard>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Ruler} title={search ? 'No sizes match your search' : 'No sizes yet'}
            description={search ? 'Try a different search term.' : 'Create your first size.'}
            actionLabel="Add Size" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Size Name</th>
                <th>Code</th>
                <th>International</th>
                <th>Group</th>
                <th>Measurements</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((size) => (
                <tr key={size.id} className="admin-table-row">
                  <td className="text-sm font-medium text-text-primary">{size.name}</td>
                  <td className="text-sm text-text-secondary">{size.code || '-'}</td>
                  <td className="text-sm text-text-secondary">{size.international_size || '-'}</td>
                  <td>
                    <AdminBadge variant="info" className="text-[10px]">{size.size_group || size.category || '-'}</AdminBadge>
                  </td>
                  <td className="text-sm text-text-secondary">
                    {[size.chest && `C:${size.chest}`, size.waist && `W:${size.waist}`,
                      size.hips && `H:${size.hips}`, size.length && `L:${size.length}`
                    ].filter(Boolean).join(' | ') || '-'}
                  </td>
                  <td className="text-sm text-text-secondary">{size.sort_order ?? 0}</td>
                  <td>
                    <button onClick={() => toggleStatus(size)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        size.status ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                      }`}>
                      {size.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="manage sizes">
                        <button onClick={() => openEdit(size)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Edit3 size={14} className="text-text-secondary" />
                        </button>
                        <button onClick={() => setDeleteConfirm(size)}
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
        title={editing ? 'Edit Size' : 'Add Size'} size="lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Size Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Medium" required error={errors.name} />
              <AdminInput label="Size Code" value={form.code} onChange={handleChange('code')} placeholder="e.g. M" required error={errors.code} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AdminInput label="International Size" value={form.international_size} onChange={handleChange('international_size')} placeholder="e.g. US 8 / EU 38" />
              <AdminSelect label="Size Group" value={form.size_group} onChange={handleChange('size_group')} options={sizeGroups} error={errors.size_group} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 pb-2 border-b border-border/30">Measurements (inches/cm)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminInput label="Chest" value={form.chest} onChange={handleChange('chest')} placeholder="e.g. 38" error={errors.chest} />
              <AdminInput label="Waist" value={form.waist} onChange={handleChange('waist')} placeholder="e.g. 30" error={errors.waist} />
              <AdminInput label="Hips" value={form.hips} onChange={handleChange('hips')} placeholder="e.g. 40" error={errors.hips} />
              <AdminInput label="Length" value={form.length} onChange={handleChange('length')} placeholder="e.g. 28" error={errors.length} />
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
              {saving ? 'Saving...' : editing ? 'Update Size' : 'Create Size'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Size"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
