import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Mail, BellRing } from 'lucide-react';
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
import useNotificationTemplatesStore from '../../../stores/notificationTemplates.store';

const typeBadge = {
  email: 'primary',
  sms: 'info',
  push: 'warning',
  whatsapp: 'success',
};

export default function AdminNotificationTemplates() {
  const { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useNotificationTemplatesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', type: 'email', subject: '', body: '', variables: '', status: true,
  });
  const [saving, setSaving] = useState(false);

  const rules = {
    name: [{ required: true }],
    subject: [{ required: true }],
    body: [{ required: true }],
  };
  const { errors, validate, clearErrors, clearField } = useFormValidation(rules);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'email', subject: '', body: '', variables: '', status: true });
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (tpl) => {
    setEditing(tpl);
    setForm({
      name: tpl.name || '',
      type: tpl.type || 'email',
      subject: tpl.subject || '',
      body: tpl.body || '',
      variables: tpl.variables ? (typeof tpl.variables === 'string' ? tpl.variables : JSON.stringify(tpl.variables, null, 2)) : '',
      status: tpl.status ?? true,
    });
    clearErrors();
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate(form)) { setSaving(false); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.variables) {
        try { payload.variables = JSON.parse(payload.variables); } catch { payload.variables = form.variables; }
      }
      if (editing) {
        await updateTemplate(editing.id, payload);
      } else {
        await createTemplate(payload);
      }
      setModalOpen(false);
      fetchTemplates();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteTemplate(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchTemplates();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    clearField(field);
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notification Templates</h1>
          <p className="text-sm text-text-secondary">{templates.length} templates</p>
        </div>
        <PermissionGuard permission="create notification templates">
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Template
          </AdminButton>
        </PermissionGuard>
      </div>

      {templates.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={BellRing} title="No templates yet" description="Create your first notification template." actionLabel="Add Template" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <motion.div key={tpl.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Mail size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={typeBadge[tpl.type] || 'default'} className="text-[10px]">
                  {tpl.type}
                </AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{tpl.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {tpl.subject ? (tpl.subject.length > 50 ? tpl.subject.slice(0, 50) + '...' : tpl.subject) : 'No subject'}
              </p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit notification templates">
                  <button onClick={() => openEdit(tpl)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                    <Edit3 size={12} className="inline mr-1" /> Edit
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="delete notification templates">
                  <button onClick={() => setDeleteConfirm(tpl)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Template' : 'Add Template'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Template Name" value={form.name} onChange={handleChange('name')} placeholder="e.g. Welcome Email" required error={errors.name} />
            <AdminSelect label="Type" value={form.type} onChange={handleChange('type')} options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'push', label: 'Push' },
              { value: 'whatsapp', label: 'WhatsApp' },
            ]} />
          </div>
          <AdminInput label="Subject" value={form.subject} onChange={handleChange('subject')} placeholder="Email subject line" error={errors.subject} />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Body</label>
            <textarea value={form.body} onChange={handleChange('body')} placeholder="Template body content..." rows={5} className={`admin-input w-full resize-none ${errors.body ? 'border-danger' : ''}`} />
            {errors.body && <p className="text-xs text-danger mt-1">{errors.body}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Variables (JSON)</label>
            <textarea value={form.variables} onChange={handleChange('variables')} placeholder='{"name": "User Name", "email": "User Email"}' rows={3} className="admin-input w-full resize-none font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2 pt-2">
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

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
