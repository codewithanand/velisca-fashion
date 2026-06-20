import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Mail, Download, Search } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminInput from '../../../components/admin/AdminInput';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminModal from '../../../components/admin/AdminModal';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminPagination from '../../../components/admin/AdminPagination';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useNewslettersStore from '../../../stores/newsletters.store';

export default function AdminNewsletters() {
  const { subscribers, loading, pagination, fetchSubscribers, deleteSubscriber, updateSubscriber, exportEmails } = useNewslettersStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [importEmail, setImportEmail] = useState('');
  const [params, setParams] = useState({ page: 1, per_page: 20, search: '' });

  useEffect(() => { fetchSubscribers(params); }, [fetchSubscribers, params]);

  const handleDelete = async () => {
    await deleteSubscriber(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleExport = async () => {
    const emails = await exportEmails();
    if (emails.length > 0) {
      const blob = new Blob([emails.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    if (importEmail) {
      try {
        const { adminNewsletterService } = await import('../../../services/admin/adminService');
        await adminNewsletterService.create({ email: importEmail });
        setImportModal(false);
        setImportEmail('');
        fetchSubscribers(params);
      } catch { /* ignore */ }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Newsletter Subscribers</h1>
          <p className="text-sm text-text-secondary">{pagination?.total || subscribers.length} subscribers</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="outline" onClick={handleExport}>
            <Download size={16} /> Export
          </AdminButton>
          <PermissionGuard permission="manage newsletters">
            <AdminButton onClick={() => setImportModal(true)}>
              <Mail size={16} /> Add Subscriber
            </AdminButton>
          </PermissionGuard>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search emails..."
            value={params.search}
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            className="admin-input pl-10"
          />
        </div>
        <select
          value={params.status || ''}
          onChange={(e) => setParams({ ...params, status: e.target.value || undefined, page: 1 })}
          className="admin-input w-40"
        >
          <option value="">All Status</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {subscribers.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={Mail} title="No subscribers" description="Newsletter subscribers will appear here." actionLabel="Add Subscriber" onAction={() => setImportModal(true)} />
        </AdminCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Status</th><th>Subscribed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-medium text-text-primary">{sub.email}</td>
                  <td>
                    <AdminBadge variant={sub.status === 'subscribed' ? 'success' : 'danger'} className="text-[10px]">{sub.status}</AdminBadge>
                  </td>
                  <td className="text-sm text-text-secondary">
                    {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {sub.status === 'subscribed' ? (
                        <button onClick={() => updateSubscriber(sub.id, { status: 'unsubscribed' }).then(() => fetchSubscribers(params))}
                          className="px-2 py-1 text-[10px] rounded-lg bg-amber-50 text-warning hover:bg-amber-100 font-medium">
                          Unsubscribe
                        </button>
                      ) : (
                        <button onClick={() => updateSubscriber(sub.id, { status: 'subscribed' }).then(() => fetchSubscribers(params))}
                          className="px-2 py-1 text-[10px] rounded-lg bg-green-50 text-success hover:bg-green-100 font-medium">
                          Resubscribe
                        </button>
                      )}
                      <PermissionGuard permission="manage newsletters">
                        <button onClick={() => setDeleteConfirm(sub)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && <AdminPagination meta={pagination} onPageChange={(page) => setParams({ ...params, page })} />}
        </div>
      )}

      <AdminModal isOpen={importModal} onClose={() => setImportModal(false)} title="Add Subscriber">
        <div className="space-y-4">
          <AdminInput label="Email Address" type="email" value={importEmail} onChange={(e) => setImportEmail(e.target.value)} placeholder="subscriber@example.com" required />
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setImportModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleImport}>Add</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Subscriber" message={`Delete "${deleteConfirm?.email}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
