import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, GripVertical, Eye, EyeOff, Layout } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useHomepageStore from '../../../stores/homepage.store';

const sectionTypes = [
  { value: 'hero_banner', label: 'Hero Banner' },
  { value: 'featured_categories', label: 'Featured Categories' },
  { value: 'collections', label: 'Collections' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'trending_products', label: 'Trending Products' },
  { value: 'best_sellers', label: 'Best Sellers' },
  { value: 'brand_story', label: 'Brand Story' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'blog_highlights', label: 'Blog Highlights' },
  { value: 'video_section', label: 'Video Section' },
  { value: 'announcement_strip', label: 'Announcement Strip' },
  { value: 'image_banner', label: 'Image Banner' },
  { value: 'custom_html', label: 'Custom HTML' },
];

export default function HomepageBuilder() {
  const { layout, layouts, sections, fetchLayout, fetchLayouts, fetchSections, createLayout, updateLayout, deleteLayout, createSection, updateSection, deleteSection, reorderSections } = useHomepageStore();
  const [sectionModal, setSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [layoutModal, setLayoutModal] = useState(false);
  const [layoutForm, setLayoutForm] = useState({ name: '', is_active: false });
  const [sectionForm, setSectionForm] = useState({
    title: '', section_type: 'hero_banner', section_key: '',
    status: true, settings_json: {},
  });
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchLayout();
    fetchLayouts();
    fetchSections();
  }, [fetchLayout, fetchLayouts, fetchSections]);

  const openAddSection = () => {
    setEditingSection(null);
    setSectionForm({ title: '', section_type: 'hero_banner', section_key: '', status: true, settings_json: {} });
    setSectionModal(true);
  };

  const openEditSection = (s) => {
    setEditingSection(s);
    setSectionForm({
      title: s.title || '',
      section_type: s.section_type || 'hero_banner',
      section_key: s.section_key || '',
      status: s.status ?? true,
      settings_json: s.settings_json || {},
    });
    setSectionModal(true);
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      if (editingSection) {
        await updateSection(editingSection.id, sectionForm);
      } else {
        await createSection(sectionForm);
      }
      setSectionModal(false);
      fetchSections();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteSection = async () => {
    await deleteSection(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleToggleSection = async (s) => {
    await updateSection(s.id, { ...s, status: !s.status });
    fetchSections();
  };

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const items = [...sections];
    const [moved] = items.splice(draggedItem, 1);
    items.splice(index, 0, moved);
    setDraggedItem(index);
    const reordered = items.map((item, i) => ({ id: item.id, sort_order: i }));
    reorderSections(reordered);
    fetchSections();
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      if (layoutForm.id) {
        await updateLayout(layoutForm.id, layoutForm);
      } else {
        await createLayout(layoutForm);
      }
      setLayoutModal(false);
      fetchLayouts();
      fetchLayout();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Homepage Builder</h1>
          <p className="text-sm text-text-secondary">{sections.length} sections • {sections.filter(s => s.status).length} active</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="outline" onClick={() => {
            setLayoutForm({ name: '', is_active: false });
            setLayoutModal(true);
          }}>
            <Layout size={16} /> New Layout
          </AdminButton>
          <PermissionGuard permission="manage homepage">
            <AdminButton onClick={openAddSection}>
              <Plus size={16} /> Add Section
            </AdminButton>
          </PermissionGuard>
        </div>
      </div>

      {layout && (
        <AdminCard className="bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Active Layout: <span className="font-bold">{layout.name}</span></p>
              <p className="text-xs text-text-secondary">{layout.sections?.length || 0} sections in this layout</p>
            </div>
            <AdminBadge variant="success">Active</AdminBadge>
          </div>
        </AdminCard>
      )}

      {sections.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Layout} title="No sections yet" description="Add sections to build your homepage." actionLabel="Add Section" onAction={openAddSection} />
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-card p-4 flex items-center gap-4 group"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="cursor-grab active:cursor-grabbing text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity">
                <GripVertical size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{section.title || 'Untitled Section'}</h3>
                  <AdminBadge variant="default" className="text-[10px] shrink-0">{section.section_type}</AdminBadge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">Order: #{section.sort_order} • Items: {section.items?.length || 0}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggleSection(section)}
                  className={`p-1.5 rounded-lg transition-colors ${section.status ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}>
                  {section.status ? <EyeOff size={14} className="text-warning" /> : <Eye size={14} className="text-success" />}
                </button>
                <button onClick={() => openEditSection(section)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Edit3 size={14} className="text-text-secondary" />
                </button>
                <PermissionGuard permission="manage homepage">
                  <button onClick={() => setDeleteConfirm(section)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={sectionModal} onClose={() => setSectionModal(false)} title={editingSection ? 'Edit Section' : 'Add Section'} size="lg">
        <div className="space-y-4">
          <AdminInput label="Section Title" value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} placeholder="Enter section title" />
          <AdminSelect label="Section Type" value={sectionForm.section_type} onChange={(e) => setSectionForm({ ...sectionForm, section_type: e.target.value })} options={sectionTypes} />
          <AdminInput label="Section Key" value={sectionForm.section_key} onChange={(e) => setSectionForm({ ...sectionForm, section_key: e.target.value })} placeholder="unique-key (optional)" />
          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sectionForm.status} onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setSectionModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveSection} disabled={saving}>
              {saving ? 'Saving...' : editingSection ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminModal isOpen={layoutModal} onClose={() => setLayoutModal(false)} title="Manage Layout">
        <div className="space-y-4">
          <AdminInput label="Layout Name" value={layoutForm.name} onChange={(e) => setLayoutForm({ ...layoutForm, name: e.target.value })} placeholder="e.g. Summer 2025" />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={layoutForm.is_active} onChange={(e) => setLayoutForm({ ...layoutForm, is_active: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Set as active layout</span>
            </label>
          </div>
          {layouts.length > 1 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary mb-2">Existing Layouts</p>
              <div className="space-y-2">
                {layouts.filter(l => l.id !== layout?.id).map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <span className="text-sm text-text-primary">{l.name}</span>
                    <AdminButton size="sm" variant="ghost" onClick={async () => { await updateLayout(l.id, { is_active: true }); fetchLayouts(); fetchLayout(); }}>
                      Activate
                    </AdminButton>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setLayoutModal(false)}>Close</AdminButton>
            <AdminButton onClick={handleSaveLayout} disabled={saving}>
              {saving ? 'Saving...' : 'Save Layout'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
