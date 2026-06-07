import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Percent, ToggleLeft } from 'lucide-react';
import api from '../../../services/api';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';

const typeLabels = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
  free_shipping: 'Free Shipping',
};

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minimum_amount: '',
  maximum_discount: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/coupons', { page: 1, per_page: 50 });
      setCoupons(res.data.coupons.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: coupon.value?.toString() || '',
      minimum_amount: coupon.minimum_amount?.toString() || '',
      maximum_discount: coupon.maximum_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
      };
      if (form.minimum_amount) payload.minimum_amount = Number(form.minimum_amount);
      if (form.maximum_discount) payload.maximum_discount = Number(form.maximum_discount);
      if (form.usage_limit) payload.usage_limit = Number(form.usage_limit);
      if (form.starts_at) payload.starts_at = form.starts_at;
      if (form.expires_at) payload.expires_at = form.expires_at;

      if (editing) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/coupons/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to delete coupon');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon.id}/toggle`);
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to toggle coupon');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Coupons</h1>
          <p className="text-sm text-text-secondary">{coupons.length} coupons</p>
        </div>
        <AdminButton onClick={openAdd}>
          <Plus size={16} />
          Add Coupon
        </AdminButton>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card p-5 animate-pulse space-y-3">
              <div className="h-8 w-24 bg-secondary rounded" />
              <div className="h-6 w-20 bg-secondary rounded" />
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-2 w-full bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <AdminCard>
          <AdminEmptyState
            icon={Percent}
            title="No coupons yet"
            description="Create your first coupon to start promotions."
            actionLabel="Add Coupon"
            onAction={openAdd}
          />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const usage = coupon.used_count || 0;
            const maxUsage = coupon.usage_limit || 1;
            const usagePercent = Math.min((usage / maxUsage) * 100, 100);

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-card p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-bold text-primary">{coupon.code}</span>
                  </div>
                  <AdminBadge variant={coupon.status === 'active' ? 'success' : 'danger'}>
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </AdminBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-text-primary">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%`
                      : coupon.type === 'free_shipping'
                        ? 'Free Shipping'
                        : formatCurrency(coupon.value)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {usage}/{maxUsage} used{coupon.expires_at ? ` • Expires ${formatDate(coupon.expires_at)}` : ''}
                  </p>
                </div>
                {coupon.usage_limit && (
                  <div className="mt-3 w-full bg-secondary rounded-full h-1.5">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
                <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                  <button
                    onClick={() => handleToggle(coupon)}
                    className="p-1.5 rounded-lg hover:bg-secondary"
                    title={coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <ToggleLeft size={14} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => openEdit(coupon)}
                    className="p-1.5 rounded-lg hover:bg-secondary"
                  >
                    <Edit3 size={14} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(coupon)}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Coupon' : 'Add Coupon'}
        size="lg"
      >
        <div className="space-y-4">
          <AdminInput
            label="Coupon Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="SUMMER20"
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
                { value: 'free_shipping', label: 'Free Shipping' },
              ]}
            />
            <AdminInput
              label={form.type === 'percentage' ? 'Discount (%)' : form.type === 'free_shipping' ? 'Value (₹)' : 'Discount (₹)'}
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="0"
              disabled={form.type === 'free_shipping'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Minimum Amount (₹)"
              type="number"
              value={form.minimum_amount}
              onChange={(e) => setForm({ ...form, minimum_amount: e.target.value })}
              placeholder="Optional"
            />
            <AdminInput
              label="Max Discount (₹)"
              type="number"
              value={form.maximum_discount}
              onChange={(e) => setForm({ ...form, maximum_discount: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Usage Limit"
              type="number"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              placeholder="Unlimited"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Start Date"
              type="date"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
            <AdminInput
              label="Expiry Date"
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={saving || !form.code || !form.value}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Delete "${deleteConfirm?.code}"? This action cannot be undone.`}
        confirmLabel={deleteLoading ? 'Deleting...' : 'Delete'}
      />
    </motion.div>
  );
}
