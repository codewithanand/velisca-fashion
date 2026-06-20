import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useCampaignsStore from '../../../stores/campaigns.store';

const campaignTypes = [
  { value: 'festival_sale', label: 'Festival Sale' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'launch_campaign', label: 'Launch Campaign' },
  { value: 'collection_campaign', label: 'Collection Campaign' },
  { value: 'newsletter_campaign', label: 'Newsletter Campaign' },
  { value: 'promotional', label: 'Promotional' },
];

export default function AdminCampaigns() {
  const { campaigns, loading, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } = useCampaignsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', campaign_type: 'promotional', description: '',
    start_date: '', end_date: '', status: true, settings_json: {},
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', campaign_type: 'promotional', description: '', start_date: '', end_date: '', status: true, settings_json: {} });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '', campaign_type: c.campaign_type || 'promotional', description: c.description || '',
      start_date: c.start_date || '', end_date: c.end_date || '', status: c.status ?? true,
      settings_json: c.settings_json || {},
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateCampaign(editing.id, form);
      } else {
        await createCampaign(form);
      }
      setModalOpen(false);
      fetchCampaigns();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCampaign(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const toggleStatus = async (c) => {
    await updateCampaign(c.id, { ...c, status: !c.status });
    fetchCampaigns();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Marketing Campaigns</h1>
          <p className="text-sm text-text-secondary">{campaigns.length} campaigns</p>
        </div>
        <PermissionGuard permission="manage campaigns">
          <AdminButton onClick={openAdd}><Plus size={16} /> Create Campaign</AdminButton>
        </PermissionGuard>
      </div>

      {campaigns.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Megaphone} title="No campaigns" description="Create your first marketing campaign." actionLabel="Create Campaign" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <motion.div key={campaign.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{campaign.name}</h3>
                  <AdminBadge variant="default" className="text-[10px] mt-1">{campaign.campaign_type}</AdminBadge>
                </div>
                <AdminBadge variant={campaign.status ? 'success' : 'danger'} className="text-[10px] shrink-0 ml-2">
                  {campaign.status ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              {campaign.description && (
                <p className="text-xs text-text-secondary line-clamp-2 mb-2">{campaign.description}</p>
              )}
              {(campaign.start_date || campaign.end_date) && (
                <p className="text-[10px] text-text-secondary">
                  {campaign.start_date && `From ${new Date(campaign.start_date).toLocaleDateString()}`}
                  {campaign.start_date && campaign.end_date && ' '}
                  {campaign.end_date && `To ${new Date(campaign.end_date).toLocaleDateString()}`}
                </p>
              )}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                <button onClick={() => toggleStatus(campaign)}
                  className={`p-1.5 rounded-lg transition-colors ${campaign.status ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}>
                  {campaign.status ? <EyeOff size={14} className="text-warning" /> : <Eye size={14} className="text-success" />}
                </button>
                <button onClick={() => openEdit(campaign)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Edit3 size={14} className="text-text-secondary" />
                </button>
                <PermissionGuard permission="manage campaigns">
                  <button onClick={() => setDeleteConfirm(campaign)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Campaign' : 'Create Campaign'} size="lg">
        <div className="space-y-4">
          <AdminInput label="Campaign Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaign name" required />
          <AdminSelect label="Campaign Type" value={form.campaign_type} onChange={(e) => setForm({ ...form, campaign_type: e.target.value })} options={campaignTypes} />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Campaign description..." className="admin-input min-h-[60px] resize-y" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Start Date" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <AdminInput label="End Date" type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Campaign" message={`Delete "${deleteConfirm?.name}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
