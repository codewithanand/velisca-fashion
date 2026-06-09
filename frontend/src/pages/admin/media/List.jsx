import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Image, Folder, File, FolderPlus } from 'lucide-react';
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
import useMediaStore from '../../../stores/media.store';

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminMedia() {
  const { media, folders, loading, fetchMedia, fetchFolders, createMedia, updateMedia, deleteMedia, createFolder, updateFolder, deleteFolder } = useMediaStore();
  const [tab, setTab] = useState('files');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    folder_id: '', file_name: '', file_path: '', file_type: '', mime_type: '', file_size: '', alt_text: '',
  });
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({ name: '', parent_id: '' });
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const mediaRules = {
    file_name: [{ required: true }],
    file_path: [{ required: true }, { url: true }],
  };
  const {
    errors: mediaErrors,
    validate: validateMediaForm,
    clearErrors: clearMediaErrors,
    clearField: clearMediaField,
  } = useFormValidation(mediaRules);

  const folderRules = {
    name: [{ required: true }],
  };
  const {
    errors: folderErrors,
    validate: validateFolderForm,
    clearErrors: clearFolderErrors,
    clearField: clearFolderField,
  } = useFormValidation(folderRules);

  useEffect(() => { fetchMedia(); fetchFolders(); }, [fetchMedia, fetchFolders]);

  const openAdd = () => {
    clearMediaErrors();
    setEditing(null);
    setForm({ folder_id: '', file_name: '', file_path: '', file_type: '', mime_type: '', file_size: '', alt_text: '' });
    setModalOpen(true);
  };

  const openEdit = (m) => {
    clearMediaErrors();
    setEditing(m);
    setForm({
      folder_id: m.folder_id || '',
      file_name: m.file_name || '',
      file_path: m.file_path || '',
      file_type: m.file_type || '',
      mime_type: m.mime_type || '',
      file_size: m.file_size || '',
      alt_text: m.alt_text || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateMediaForm(form)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateMedia(editing.id, form);
      } else {
        await createMedia(form);
      }
      setModalOpen(false);
      fetchMedia();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteMedia(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchMedia();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
    clearMediaField(field);
  };

  const openAddFolder = () => {
    clearFolderErrors();
    setEditingFolder(null);
    setFolderForm({ name: '', parent_id: '' });
    setFolderModalOpen(true);
  };

  const openEditFolder = (f) => {
    clearFolderErrors();
    setEditingFolder(f);
    setFolderForm({
      name: f.name || '',
      parent_id: f.parent_id || '',
    });
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async () => {
    if (!validateFolderForm(folderForm)) return;
    setSaving(true);
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, folderForm);
      } else {
        await createFolder(folderForm);
      }
      setFolderModalOpen(false);
      fetchFolders();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteFolder = async () => {
    await deleteFolder(deleteFolderConfirm.id);
    setDeleteFolderConfirm(null);
    fetchFolders();
  };

  const handleFolderChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFolderForm({ ...folderForm, [field]: value });
    clearFolderField(field);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Media Manager</h1>
      </div>

      <div className="flex gap-2">
        {[{ key: 'files', label: 'Files' }, { key: 'folders', label: 'Folders' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'files' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{media.length} files</p>
            <PermissionGuard permission="create media">
              <AdminButton onClick={openAdd}>
                <Plus size={16} /> Upload File
              </AdminButton>
            </PermissionGuard>
          </div>

          {media.length === 0 && !loading ? (
            <AdminCard>
              <AdminEmptyState icon={Image} title="No media files yet" description="Upload your first media file." actionLabel="Upload File" onAction={openAdd} />
            </AdminCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-3 group cursor-pointer" onClick={() => openEdit(m)}>
                  <div className="w-full aspect-square rounded-xl bg-secondary overflow-hidden flex items-center justify-center mb-2">
                    {m.file_path && (m.mime_type?.startsWith('image/') || m.file_type === 'image') ? (
                      <img src={m.file_path} alt={m.alt_text || m.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <File size={24} className="text-text-secondary" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-text-primary truncate">{m.file_name}</p>
                  <p className="text-[10px] text-text-secondary truncate">{m.file_type || m.mime_type}</p>
                  <p className="text-[10px] text-text-secondary">{formatFileSize(m.file_size)}</p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(m); }} className="p-1.5 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AdminModal isOpen={modalOpen} onClose={() => { clearMediaErrors(); setModalOpen(false); }} title={editing ? 'Edit Media' : 'Upload Media'} size="md">
            <div className="space-y-4">
              <AdminSelect label="Folder" value={form.folder_id} onChange={handleChange('folder_id')} options={[
                { value: '', label: 'None (Root)' },
                ...folders.map((f) => ({ value: f.id, label: f.name })),
              ]} />
              <AdminInput label="File Name" value={form.file_name} onChange={handleChange('file_name')} placeholder="e.g. hero-banner.jpg" error={mediaErrors.file_name} />
              <AdminInput label="File Path / URL" value={form.file_path} onChange={handleChange('file_path')} placeholder="https://..." error={mediaErrors.file_path} />
              <div className="grid grid-cols-2 gap-4">
                <AdminInput label="File Type" value={form.file_type} onChange={handleChange('file_type')} placeholder="e.g. image" />
                <AdminInput label="MIME Type" value={form.mime_type} onChange={handleChange('mime_type')} placeholder="e.g. image/jpeg" />
              </div>
              <AdminInput label="File Size (bytes)" type="number" value={form.file_size} onChange={handleChange('file_size')} placeholder="0" />
              <AdminInput label="Alt Text" value={form.alt_text} onChange={handleChange('alt_text')} placeholder="Descriptive alt text" />
              <div className="flex justify-end gap-3 pt-2">
                <AdminButton variant="ghost" onClick={() => { clearMediaErrors(); setModalOpen(false); }}>Cancel</AdminButton>
                <AdminButton onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Upload'}
                </AdminButton>
              </div>
            </div>
          </AdminModal>

          <AdminConfirmDialog
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={handleDelete}
            title="Delete Media File"
            message={`Are you sure you want to delete this file? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="danger"
          />
        </>
      )}

      {tab === 'folders' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{folders.length} folders</p>
            <PermissionGuard permission="create media folders">
              <AdminButton onClick={openAddFolder}>
                <FolderPlus size={16} /> Add Folder
              </AdminButton>
            </PermissionGuard>
          </div>

          {folders.length === 0 && !loading ? (
            <AdminCard>
              <AdminEmptyState icon={Folder} title="No folders yet" description="Create your first media folder." actionLabel="Add Folder" onAction={openAddFolder} />
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((f) => (
                <motion.div key={f.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
                  <div className="flex items-center gap-3 mb-3">
                    <Folder size={20} className="text-text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">{f.name}</h3>
                  </div>
                  {f.parent && <p className="text-xs text-text-secondary">Parent: {f.parent.name}</p>}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PermissionGuard permission="edit media folders">
                      <button onClick={() => openEditFolder(f)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium transition-colors">
                        <Edit3 size={12} className="inline mr-1" /> Edit
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete media folders">
                      <button onClick={() => setDeleteFolderConfirm(f)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium transition-colors">
                        <Trash2 size={12} className="inline mr-1" /> Delete
                      </button>
                    </PermissionGuard>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AdminModal isOpen={folderModalOpen} onClose={() => { clearFolderErrors(); setFolderModalOpen(false); }} title={editingFolder ? 'Edit Folder' : 'Add Folder'} size="md">
            <div className="space-y-4">
              <AdminInput label="Folder Name" value={folderForm.name} onChange={handleFolderChange('name')} placeholder="Enter folder name" required error={folderErrors.name} />
              <AdminSelect label="Parent Folder" value={folderForm.parent_id} onChange={handleFolderChange('parent_id')} options={[
                { value: '', label: 'None (Root)' },
                ...folders.filter((f) => f.id !== editingFolder?.id).map((f) => ({ value: f.id, label: f.name })),
              ]} />
              <div className="flex justify-end gap-3 pt-2">
                <AdminButton variant="ghost" onClick={() => { clearFolderErrors(); setFolderModalOpen(false); }}>Cancel</AdminButton>
                <AdminButton onClick={handleSaveFolder} disabled={saving}>
                  {saving ? 'Saving...' : editingFolder ? 'Update' : 'Create'}
                </AdminButton>
              </div>
            </div>
          </AdminModal>

          <AdminConfirmDialog
            isOpen={!!deleteFolderConfirm}
            onClose={() => setDeleteFolderConfirm(null)}
            onConfirm={handleDeleteFolder}
            title="Delete Folder"
            message={`Are you sure you want to delete this folder? Files inside will not be deleted.`}
            confirmLabel="Delete"
            variant="danger"
          />
        </>
      )}
    </motion.div>
  );
}
