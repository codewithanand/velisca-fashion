import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Truck, MapPin, DollarSign } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useShippingStore from '../../../stores/shipping.store';
import useFormValidation from '../../../hooks/useFormValidation';

const tabs = [
  { key: 'methods', label: 'Methods', icon: Truck },
  { key: 'zones', label: 'Zones', icon: MapPin },
  { key: 'rates', label: 'Rates', icon: DollarSign },
];

export default function AdminShipping() {
  const { methods, zones, rates, loading, fetchMethods, createMethod, updateMethod, deleteMethod, fetchZones, createZone, updateZone, deleteZone, fetchRates, createRate, updateRate, deleteRate } = useShippingStore();
  const [activeTab, setActiveTab] = useState('methods');

  // Method state
  const [methodModal, setMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodForm, setMethodForm] = useState({ name: '', code: '', type: 'flat', delivery_time: '', base_cost: '', status: true });
  const [methodDelete, setMethodDelete] = useState(null);
  const [methodSaving, setMethodSaving] = useState(false);

  // Zone state
  const [zoneModal, setZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({ name: '', country: '', state: '', city: '', postal_code: '', status: true });
  const [zoneDelete, setZoneDelete] = useState(null);
  const [zoneSaving, setZoneSaving] = useState(false);

  // Rate state
  const [rateModal, setRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateForm, setRateForm] = useState({ method_id: '', zone_id: '', min_order: '', max_order: '', rate: '' });
  const [rateDelete, setRateDelete] = useState(null);
  const [rateSaving, setRateSaving] = useState(false);

  const methodRules = {
    name: [{ required: true }],
    code: [{ required: true }],
    base_cost: [{ numeric: true }, { min: 0 }],
  };
  const { errors: methodErrors, validate: validateMethod, clearErrors: clearMethodErrors, clearField: clearMethodField } = useFormValidation(methodRules);

  const zoneRules = {
    name: [{ required: true }],
  };
  const { errors: zoneErrors, validate: validateZone, clearErrors: clearZoneErrors, clearField: clearZoneField } = useFormValidation(zoneRules);

  const rateRules = {
    method_id: [{ required: true }],
    zone_id: [{ required: true }],
    rate: [{ required: true }, { numeric: true }, { min: 0 }],
    min_order: [{ numeric: true }, { min: 0 }],
    max_order: [{ numeric: true }, { min: 0 }],
  };
  const { errors: rateErrors, validate: validateRate, clearErrors: clearRateErrors, clearField: clearRateField } = useFormValidation(rateRules);

  useEffect(() => {
    fetchMethods();
    fetchZones();
    fetchRates();
  }, [fetchMethods, fetchZones, fetchRates]);

  const handleChange = (setter, clearField) => (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setter((prev) => ({ ...prev, [field]: value }));
    if (clearField) clearField(field);
  };

  // --- Methods ---
  const openAddMethod = () => {
    clearMethodErrors();
    setEditingMethod(null);
    setMethodForm({ name: '', code: '', type: 'flat', delivery_time: '', base_cost: '', status: true });
    setMethodModal(true);
  };

  const openEditMethod = (m) => {
    clearMethodErrors();
    setEditingMethod(m);
    setMethodForm({ name: m.name || '', code: m.code || '', type: m.type || 'flat', delivery_time: m.delivery_time || '', base_cost: m.base_cost?.toString() || '', status: m.status ?? true });
    setMethodModal(true);
  };

  const handleSaveMethod = async () => {
    if (!validateMethod(methodForm)) return;
    setMethodSaving(true);
    try {
      if (editingMethod) {
        await updateMethod(editingMethod.id, methodForm);
      } else {
        await createMethod(methodForm);
      }
      setMethodModal(false);
      fetchMethods();
    } catch { /* ignore */ }
    setMethodSaving(false);
  };

  const handleDeleteMethod = async () => {
    await deleteMethod(methodDelete.id);
    setMethodDelete(null);
    fetchMethods();
  };

  // --- Zones ---
  const openAddZone = () => {
    clearZoneErrors();
    setEditingZone(null);
    setZoneForm({ name: '', country: '', state: '', city: '', postal_code: '', status: true });
    setZoneModal(true);
  };

  const openEditZone = (z) => {
    clearZoneErrors();
    setEditingZone(z);
    setZoneForm({ name: z.name || '', country: z.country || '', state: z.state || '', city: z.city || '', postal_code: z.postal_code || '', status: z.status ?? true });
    setZoneModal(true);
  };

  const handleSaveZone = async () => {
    if (!validateZone(zoneForm)) return;
    setZoneSaving(true);
    try {
      if (editingZone) {
        await updateZone(editingZone.id, zoneForm);
      } else {
        await createZone(zoneForm);
      }
      setZoneModal(false);
      fetchZones();
    } catch { /* ignore */ }
    setZoneSaving(false);
  };

  const handleDeleteZone = async () => {
    await deleteZone(zoneDelete.id);
    setZoneDelete(null);
    fetchZones();
  };

  // --- Rates ---
  const openAddRate = () => {
    clearRateErrors();
    setEditingRate(null);
    setRateForm({ method_id: '', zone_id: '', min_order: '', max_order: '', rate: '' });
    setRateModal(true);
  };

  const openEditRate = (r) => {
    clearRateErrors();
    setEditingRate(r);
    setRateForm({ method_id: r.method_id || '', zone_id: r.zone_id || '', min_order: r.min_order?.toString() || '', max_order: r.max_order?.toString() || '', rate: r.rate?.toString() || '' });
    setRateModal(true);
  };

  const handleSaveRate = async () => {
    if (!validateRate(rateForm)) return;
    setRateSaving(true);
    try {
      if (editingRate) {
        await updateRate(editingRate.id, rateForm);
      } else {
        await createRate(rateForm);
      }
      setRateModal(false);
      fetchRates();
    } catch { /* ignore */ }
    setRateSaving(false);
  };

  const handleDeleteRate = async () => {
    await deleteRate(rateDelete.id);
    setRateDelete(null);
    fetchRates();
  };

  const renderMethods = () => (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{methods.length} methods</p>
        <PermissionGuard permission="create shipping methods">
          <AdminButton size="sm" onClick={openAddMethod}><Plus size={14} /> Add Method</AdminButton>
        </PermissionGuard>
      </div>
      {methods.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Truck} title="No shipping methods" description="Add shipping methods for your store." actionLabel="Add Method" onAction={openAddMethod} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((m) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Truck size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={m.status ? 'success' : 'danger'} className="text-[10px]">{m.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{m.name}</h3>
              <p className="text-xs text-text-secondary">{m.code} {m.type && <span className="ml-1">• {m.type}</span>}</p>
              {m.delivery_time && <p className="text-xs text-text-secondary mt-1">Delivery: {m.delivery_time}</p>}
              <p className="text-xs text-text-secondary mt-2">Base Cost: ₹{Number(m.base_cost || 0).toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit shipping methods">
                  <button onClick={() => openEditMethod(m)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium"><Edit3 size={12} className="inline mr-1" /> Edit</button>
                </PermissionGuard>
                <PermissionGuard permission="delete shipping methods">
                  <button onClick={() => setMethodDelete(m)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  const renderZones = () => (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{zones.length} zones</p>
        <PermissionGuard permission="create shipping zones">
          <AdminButton size="sm" onClick={openAddZone}><Plus size={14} /> Add Zone</AdminButton>
        </PermissionGuard>
      </div>
      {zones.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={MapPin} title="No shipping zones" description="Define shipping zones for your store." actionLabel="Add Zone" onAction={openAddZone} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((z) => (
            <motion.div key={z.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={z.status ? 'success' : 'danger'} className="text-[10px]">{z.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{z.name}</h3>
              {z.country && <p className="text-xs text-text-secondary">Country: {z.country}</p>}
              {z.state && <p className="text-xs text-text-secondary">State: {z.state}</p>}
              {z.city && <p className="text-xs text-text-secondary">City: {z.city}</p>}
              {z.postal_code && <p className="text-xs text-text-secondary">Postal Code: {z.postal_code}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit shipping zones">
                  <button onClick={() => openEditZone(z)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium"><Edit3 size={12} className="inline mr-1" /> Edit</button>
                </PermissionGuard>
                <PermissionGuard permission="delete shipping zones">
                  <button onClick={() => setZoneDelete(z)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  const renderRates = () => (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{rates.length} rates</p>
        <PermissionGuard permission="create shipping rates">
          <AdminButton size="sm" onClick={openAddRate}><Plus size={14} /> Add Rate</AdminButton>
        </PermissionGuard>
      </div>
      {rates.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={DollarSign} title="No shipping rates" description="Define shipping rates for your methods and zones." actionLabel="Add Rate" onAction={openAddRate} />
        </AdminCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Method</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Zone</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Min Order</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Max Order</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Rate</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-border/10 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-text-primary">{r.method?.name || r.method_id}</td>
                  <td className="py-3 px-4 text-text-primary">{r.zone?.name || r.zone_id}</td>
                  <td className="py-3 px-4 text-text-secondary">{r.min_order ? `₹${Number(r.min_order).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="py-3 px-4 text-text-secondary">{r.max_order ? `₹${Number(r.max_order).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="py-3 px-4 text-text-primary font-medium">₹{Number(r.rate || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="edit shipping rates">
                        <button onClick={() => openEditRate(r)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit3 size={14} className="text-text-secondary" /></button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete shipping rates">
                        <button onClick={() => setRateDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-danger" /></button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Shipping</h1>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'methods' && renderMethods()}
      {activeTab === 'zones' && renderZones()}
      {activeTab === 'rates' && renderRates()}

      {/* Method Modal */}
      <AdminModal isOpen={methodModal} onClose={() => setMethodModal(false)} title={editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Method Name" value={methodForm.name} onChange={handleChange(setMethodForm, clearMethodField)('name')} placeholder="e.g. Standard Delivery" required error={methodErrors.name} />
            <AdminInput label="Code" value={methodForm.code} onChange={handleChange(setMethodForm, clearMethodField)('code')} placeholder="e.g. standard" error={methodErrors.code} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect label="Type" value={methodForm.type} onChange={handleChange(setMethodForm)('type')} options={[
              { value: 'flat', label: 'Flat Rate' },
              { value: 'free', label: 'Free Shipping' },
              { value: 'pickup', label: 'Pickup' },
              { value: 'custom', label: 'Custom' },
            ]} />
            <AdminInput label="Delivery Time" value={methodForm.delivery_time} onChange={handleChange(setMethodForm)('delivery_time')} placeholder="e.g. 3-5 business days" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Base Cost" type="number" value={methodForm.base_cost} onChange={handleChange(setMethodForm, clearMethodField)('base_cost')} placeholder="0" error={methodErrors.base_cost} />
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <input type="checkbox" checked={methodForm.status} onChange={handleChange(setMethodForm)('status')} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setMethodModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveMethod} disabled={methodSaving}>{methodSaving ? 'Saving...' : editingMethod ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Zone Modal */}
      <AdminModal isOpen={zoneModal} onClose={() => setZoneModal(false)} title={editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'} size="md">
        <div className="space-y-4">
          <AdminInput label="Zone Name" value={zoneForm.name} onChange={handleChange(setZoneForm, clearZoneField)('name')} placeholder="e.g. North India" required error={zoneErrors.name} />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Country" value={zoneForm.country} onChange={handleChange(setZoneForm)('country')} placeholder="e.g. India" />
            <AdminInput label="State" value={zoneForm.state} onChange={handleChange(setZoneForm)('state')} placeholder="e.g. Delhi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="City" value={zoneForm.city} onChange={handleChange(setZoneForm)('city')} placeholder="e.g. New Delhi" />
            <AdminInput label="Postal Code" value={zoneForm.postal_code} onChange={handleChange(setZoneForm)('postal_code')} placeholder="e.g. 110001" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={zoneForm.status} onChange={handleChange(setZoneForm)('status')} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setZoneModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveZone} disabled={zoneSaving}>{zoneSaving ? 'Saving...' : editingZone ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Rate Modal */}
      <AdminModal isOpen={rateModal} onClose={() => setRateModal(false)} title={editingRate ? 'Edit Shipping Rate' : 'Add Shipping Rate'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminSelect label="Shipping Method" value={rateForm.method_id} onChange={handleChange(setRateForm, clearRateField)('method_id')} options={methods.map((m) => ({ value: m.id, label: m.name }))} error={rateErrors.method_id} />
            <AdminSelect label="Shipping Zone" value={rateForm.zone_id} onChange={handleChange(setRateForm, clearRateField)('zone_id')} options={zones.map((z) => ({ value: z.id, label: z.name }))} error={rateErrors.zone_id} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AdminInput label="Min Order (₹)" type="number" value={rateForm.min_order} onChange={handleChange(setRateForm, clearRateField)('min_order')} placeholder="0" error={rateErrors.min_order} />
            <AdminInput label="Max Order (₹)" type="number" value={rateForm.max_order} onChange={handleChange(setRateForm, clearRateField)('max_order')} placeholder="0" error={rateErrors.max_order} />
            <AdminInput label="Rate (₹)" type="number" value={rateForm.rate} onChange={handleChange(setRateForm, clearRateField)('rate')} placeholder="0" required error={rateErrors.rate} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setRateModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveRate} disabled={rateSaving || !rateForm.method_id || !rateForm.zone_id || !rateForm.rate}>{rateSaving ? 'Saving...' : editingRate ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!methodDelete} onClose={() => setMethodDelete(null)} onConfirm={handleDeleteMethod} title="Delete Shipping Method" message={`Delete "${methodDelete?.name}"?`} confirmLabel="Delete" variant="danger" />
      <AdminConfirmDialog isOpen={!!zoneDelete} onClose={() => setZoneDelete(null)} onConfirm={handleDeleteZone} title="Delete Shipping Zone" message={`Delete "${zoneDelete?.name}"?`} confirmLabel="Delete" variant="danger" />
      <AdminConfirmDialog isOpen={!!rateDelete} onClose={() => setRateDelete(null)} onConfirm={handleDeleteRate} title="Delete Shipping Rate" message={`Delete this shipping rate?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
