import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Search } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminPagination from '../../../components/admin/AdminPagination';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useInventoryLogsStore from '../../../stores/inventoryLogs.store';
import useWarehousesStore from '../../../stores/warehouses.store';

const movementTypeBadge = {
  stock_in: 'success',
  stock_out: 'danger',
  adjustment: 'warning',
  return: 'info',
  transfer: 'primary',
};

export default function AdminInventoryLogs() {
  const { logs, loading, pagination, fetchLogs, createLog } = useInventoryLogsStore();
  const { warehouses, fetchWarehouses } = useWarehousesStore();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: '', variant_id: '', warehouse_id: '', movement_type: 'stock_in', quantity: '', remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchLogs({ page, search: search || undefined }); }, [page, search, fetchLogs]);
  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createLog({ ...form, quantity: Number(form.quantity) });
      setFormOpen(false);
      setForm({ product_id: '', variant_id: '', warehouse_id: '', movement_type: 'stock_in', quantity: '', remarks: '' });
      fetchLogs({ page: 1, search: search || undefined });
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Inventory Logs</h1>
          <p className="text-sm text-text-secondary">{pagination.total} movements recorded</p>
        </div>
        <PermissionGuard permission="create inventory logs">
          <AdminButton onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Record Movement
          </AdminButton>
        </PermissionGuard>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by product or warehouse..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-input pl-10 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={ClipboardList} title="No inventory logs" description={search ? 'No logs match your search.' : 'No inventory movements recorded yet.'} actionLabel="Record Movement" onAction={() => setFormOpen(true)} />
        </AdminCard>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Warehouse</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="admin-table-row">
                  <td className="text-sm text-text-primary font-medium">{log.product_id || '-'}</td>
                  <td className="text-sm text-text-secondary">{log.variant_id || '-'}</td>
                  <td className="text-sm text-text-secondary">{log.warehouse?.name || log.warehouse_id}</td>
                  <td>
                    <AdminBadge variant={movementTypeBadge[log.movement_type] || 'default'} className="text-[10px]">
                      {log.movement_type?.replace('_', ' ')}
                    </AdminBadge>
                  </td>
                  <td className={`text-sm font-medium ${log.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                    {log.quantity > 0 ? '+' : ''}{log.quantity}
                  </td>
                  <td className="text-sm text-text-secondary">{new Date(log.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination?.last_page > 1 && (
            <div className="px-5 py-3 border-t border-border/30">
              <AdminPagination page={pagination.page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <AdminModal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Record Inventory Movement" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Product ID" value={form.product_id} onChange={handleChange('product_id')} placeholder="Product ID" />
            <AdminInput label="Variant ID" value={form.variant_id} onChange={handleChange('variant_id')} placeholder="Variant ID (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect label="Warehouse" value={form.warehouse_id} onChange={handleChange('warehouse_id')} options={warehouses.map((w) => ({ value: w.id, label: w.name }))} />
            <AdminSelect label="Movement Type" value={form.movement_type} onChange={handleChange('movement_type')} options={[
              { value: 'stock_in', label: 'Stock In' },
              { value: 'stock_out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' },
              { value: 'return', label: 'Return' },
              { value: 'transfer', label: 'Transfer' },
            ]} />
          </div>
          <AdminInput label="Quantity" type="number" value={form.quantity} onChange={handleChange('quantity')} placeholder="0" />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Remarks</label>
            <textarea value={form.remarks} onChange={handleChange('remarks')} placeholder="Optional remarks..." rows={3} className="admin-input w-full resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setFormOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Record Movement'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </motion.div>
  );
}
