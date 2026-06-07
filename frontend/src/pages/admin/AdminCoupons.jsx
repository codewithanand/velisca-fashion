import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Percent } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';
import AdminInput from '../../components/admin/AdminInput';
import AdminSelect from '../../components/admin/AdminSelect';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const initialCoupons = [
  { id: 1, code: 'WELCOME20', discount: 20, type: 'percentage', usage: 145, maxUsage: 200, expires: '2024-12-31', status: 'active' },
  { id: 2, code: 'FLAT500', discount: 500, type: 'fixed', usage: 78, maxUsage: 100, expires: '2024-06-30', status: 'active' },
  { id: 3, code: 'SUMMER10', discount: 10, type: 'percentage', usage: 200, maxUsage: 200, expires: '2024-08-31', status: 'expired' },
];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage', maxUsage: '', expires: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ code: '', discount: '', type: 'percentage', maxUsage: '', expires: '' });
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({ code: coupon.code, discount: coupon.discount.toString(), type: coupon.type, maxUsage: coupon.maxUsage.toString(), expires: coupon.expires });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setCoupons(coupons.map((c) => c.id === editing.id ? { ...c, ...form, discount: Number(form.discount), maxUsage: Number(form.maxUsage) } : c));
    } else {
      setCoupons([...coupons, { ...form, id: Date.now(), discount: Number(form.discount), maxUsage: Number(form.maxUsage), usage: 0, status: 'active' }]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setCoupons(coupons.filter((c) => c.id !== deleteConfirm.id));
    setDeleteConfirm(null);
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

      {coupons.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Percent} title="No coupons yet" description="Create your first coupon to start promotions." actionLabel="Add Coupon" onAction={openAdd} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <motion.div key={coupon.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
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
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                </p>
                <p className="text-xs text-text-secondary">
                  {coupon.usage}/{coupon.maxUsage} used • Expires {coupon.expires}
                </p>
              </div>
              <div className="mt-3 w-full bg-secondary rounded-full h-1.5">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(coupon.usage / coupon.maxUsage) * 100}%` }} />
              </div>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit3 size={14} className="text-text-secondary" /></button>
                <button onClick={() => setDeleteConfirm(coupon)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-danger" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="space-y-4">
          <AdminInput label="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label={form.type === 'percentage' ? 'Discount (%)' : 'Discount ($)'} type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" />
            <AdminSelect label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Max Usage" type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} placeholder="100" />
            <AdminInput label="Expiry Date" type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave}>{editing ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Coupon" message={`Delete "${deleteConfirm?.code}"? This action cannot be undone.`} confirmLabel="Delete" />
    </motion.div>
  );
}
