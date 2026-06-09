import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, List, Tag, Palette, ToggleLeft } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useFormValidation from '../../../hooks/useFormValidation';
import useAttributesStore from '../../../stores/attributes.store';

const typeLabels = {
  text: 'Text',
  select: 'Select',
  multi_select: 'Multi Select',
  color: 'Color',
  boolean: 'Boolean',
  number: 'Number',
};

const typeBadge = {
  text: 'info',
  select: 'primary',
  multi_select: 'warning',
  color: 'success',
  boolean: 'default',
  number: 'danger',
};

export default function AdminAttributes() {
  const { attributes, loading, fetchAttributes, createAttribute, updateAttribute, deleteAttribute, createAttributeValue, updateAttributeValue, deleteAttributeValue } = useAttributesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [valuesModalOpen, setValuesModalOpen] = useState(false);
  const [valuesAttribute, setValuesAttribute] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'text', is_filterable: false, is_required: false, status: true });
  const [valueForm, setValueForm] = useState({ value: '', color_code: '', sort_order: 0 });
  const [editingValue, setEditingValue] = useState(null);
  const [saving, setSaving] = useState(false);

  const attrRules = {
    name: [{ required: true }],
    type: [{ required: true }],
  };
  const { errors: attrErrors, validate: validateAttr, clearErrors: clearAttrErrors, clearField: clearAttrField } = useFormValidation(attrRules);

  const valRules = {
    value: [{ required: true }],
    sort_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors: valErrors, validate: validateVal, clearErrors: clearValErrors, clearField: clearValField } = useFormValidation(valRules);

  useEffect(() => { fetchAttributes(); }, [fetchAttributes]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'text', is_filterable: false, is_required: false, status: true });
    clearAttrErrors();
    setModalOpen(true);
  };

  const openEdit = (attr) => {
    setEditing(attr);
    setForm({
      name: attr.name || '',
      type: attr.type || 'text',
      is_filterable: attr.is_filterable || false,
      is_required: attr.is_required || false,
      status: attr.status ?? true,
    });
    clearAttrErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateAttr(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateAttribute(editing.id, form);
      } else {
        await createAttribute(form);
      }
      setModalOpen(false);
      fetchAttributes();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteAttribute(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchAttributes();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    clearAttrField(field);
    setForm({ ...form, [field]: value });
  };

  const openValues = (attr) => {
    setValuesAttribute(attr);
    setValuesModalOpen(true);
  };

  const openAddValue = () => {
    setEditingValue(null);
    setValueForm({ value: '', color_code: '', sort_order: 0 });
    clearValErrors();
  };

  const openEditValue = (val) => {
    setEditingValue(val);
    setValueForm({
      value: val.value || '',
      color_code: val.color_code || '',
      sort_order: val.sort_order || 0,
    });
    clearValErrors();
  };

  const handleSaveValue = async () => {
    if (!valuesAttribute) return;
    if (!validateVal(valueForm)) return;
    try {
      if (editingValue) {
        await updateAttributeValue(valuesAttribute.id, editingValue.id, valueForm);
      } else {
        await createAttributeValue(valuesAttribute.id, valueForm);
      }
      setEditingValue(null);
      setValueForm({ value: '', color_code: '', sort_order: 0 });
      fetchAttributes();
    } catch { /* ignore */ }
  };

  const handleDeleteValue = async (valueId) => {
    if (!valuesAttribute) return;
    await deleteAttributeValue(valuesAttribute.id, valueId);
    fetchAttributes();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Attributes</h1>
          <p className="text-sm text-text-secondary">{attributes.length} attributes</p>
        </div>
        <PermissionGuard permission="create attributes">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Attribute
          </AdminButton>
        </PermissionGuard>
      </div>

      {attributes.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Tag} title="No attributes yet" description="Create attributes to define product variations." actionLabel="Add Attribute" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.map((attr) => (
            <motion.div key={attr.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Tag size={20} className="text-text-secondary" />
                </div>
                <div className="flex items-center gap-1">
                  {attr.is_filterable && <List size={14} className="text-primary" />}
                  <AdminBadge variant={attr.status ? 'success' : 'danger'} className="text-[10px]">
                    {attr.status ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{attr.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <AdminBadge variant={typeBadge[attr.type] || 'default'} className="text-[10px]">
                  {typeLabels[attr.type] || attr.type}
                </AdminBadge>
                {attr.is_required && <span className="text-xs text-danger">Required</span>}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                <span className="font-medium">{attr.values?.length || 0}</span> values
              </p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit attributes">
                  <button onClick={() => openValues(attr)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <List size={12} className="inline mr-1" /> Manage Values
                  </button>
                  <button onClick={() => openEdit(attr)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete attributes">
                  <button onClick={() => setDeleteConfirm(attr)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Attribute' : 'Add Attribute'} size="md">
        <div className="space-y-4">
          <AdminInput label="Attribute Name" value={form.name} onChange={handleChange('name')} placeholder="Enter attribute name" required error={attrErrors.name} />
          <AdminSelect label="Type" value={form.type} onChange={handleChange('type')} options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} error={attrErrors.type} />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_filterable} onChange={handleChange('is_filterable')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Filterable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_required} onChange={handleChange('is_required')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status} onChange={handleChange('status')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminModal isOpen={valuesModalOpen} onClose={() => setValuesModalOpen(false)} title={`Values for ${valuesAttribute?.name || 'Attribute'}`} size="md">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <AdminInput label="Value" value={valueForm.value} onChange={(e) => { clearValField('value'); setValueForm({ ...valueForm, value: e.target.value }); }} placeholder="Enter value" error={valErrors.value} />
            </div>
            {valuesAttribute?.type === 'color' && (
              <div className="w-20">
                <label className="text-sm font-medium text-text-primary block mb-1.5">Color</label>
                <input type="color" value={valueForm.color_code || '#000000'} onChange={(e) => setValueForm({ ...valueForm, color_code: e.target.value })} className="w-full h-10 rounded-lg border border-border cursor-pointer" />
              </div>
            )}
            <div className="w-24">
              <AdminInput label="Sort" type="number" value={valueForm.sort_order} onChange={(e) => { clearValField('sort_order'); setValueForm({ ...valueForm, sort_order: Number(e.target.value) }); }} placeholder="0" error={valErrors.sort_order} />
            </div>
            <AdminButton onClick={handleSaveValue} size="sm" disabled={!valueForm.value}>
              {editingValue ? 'Update' : 'Add'}
            </AdminButton>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {(valuesAttribute?.values || []).length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">No values yet</p>
            ) : (
              (valuesAttribute?.values || []).map((val) => (
                <div key={val.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 group/value">
                  <div className="flex items-center gap-2">
                    {valuesAttribute?.type === 'color' && val.color_code && (
                      <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: val.color_code }} />
                    )}
                    <span className="text-sm text-text-primary">{val.value}</span>
                    {val.sort_order > 0 && <span className="text-xs text-text-secondary">({val.sort_order})</span>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/value:opacity-100 transition-opacity">
                    <button onClick={() => openEditValue(val)} className="p-1 rounded hover:bg-border transition-colors">
                      <Edit3 size={12} className="text-text-secondary" />
                    </button>
                    <button onClick={() => handleDeleteValue(val.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 size={12} className="text-danger" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2">
            <AdminButton variant="ghost" onClick={() => { setValuesModalOpen(false); setEditingValue(null); }}>Close</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will remove all values associated with this attribute.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
