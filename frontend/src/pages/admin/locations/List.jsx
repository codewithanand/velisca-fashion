import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Globe, MapPin, Building2 } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useLocationsStore from '../../../stores/locations.store';
import useFormValidation from '../../../hooks/useFormValidation';

const tabs = [
  { key: 'countries', label: 'Countries', icon: Globe },
  { key: 'states', label: 'States', icon: MapPin },
  { key: 'cities', label: 'Cities', icon: Building2 },
];

export default function AdminLocations() {
  const { countries, states, cities, loading, fetchCountries, createCountry, updateCountry, deleteCountry, fetchStates, createState, updateState, deleteState, fetchCities, createCity, updateCity, deleteCity } = useLocationsStore();
  const [activeTab, setActiveTab] = useState('countries');

  // Country state
  const [countryModal, setCountryModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({ name: '', iso_code: '', phone_code: '', currency: '', status: true });
  const [countryDelete, setCountryDelete] = useState(null);
  const [countrySaving, setCountrySaving] = useState(false);

  // State state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [stateModal, setStateModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [stateForm, setStateForm] = useState({ country_id: '', name: '', code: '', status: true });
  const [stateDelete, setStateDelete] = useState(null);
  const [stateSaving, setStateSaving] = useState(false);

  // City state
  const [selectedState, setSelectedState] = useState('');
  const [cityModal, setCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityForm, setCityForm] = useState({ state_id: '', name: '', status: true });
  const [cityDelete, setCityDelete] = useState(null);
  const [citySaving, setCitySaving] = useState(false);

  const countryRules = {
    name: [{ required: true }],
    iso_code: [{ pattern: /^[A-Z]{2,3}$/, message: 'Must be 2-3 letter code' }],
    phone_code: [{ numeric: true }],
    currency: [{ minLength: 2 }],
  };
  const { errors: countryErrors, validate: validateCountry, clearErrors: clearCountryErrors, clearField: clearCountryField } = useFormValidation(countryRules);

  const stateRules = {
    name: [{ required: true }],
    code: [{ pattern: /^[A-Z]{2,3}$/, message: 'Must be 2-3 letter code' }],
  };
  const { errors: stateErrors, validate: validateState, clearErrors: clearStateErrors, clearField: clearStateField } = useFormValidation(stateRules);

  const cityRules = {
    name: [{ required: true }],
  };
  const { errors: cityErrors, validate: validateCity, clearErrors: clearCityErrors, clearField: clearCityField } = useFormValidation(cityRules);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  useEffect(() => {
    if (selectedCountry) fetchStates({ country_id: selectedCountry });
  }, [selectedCountry, fetchStates]);

  useEffect(() => {
    if (selectedState) fetchCities({ state_id: selectedState });
  }, [selectedState, fetchCities]);

  const handleChange = (setter, clearField) => (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setter((prev) => ({ ...prev, [field]: value }));
    if (clearField) clearField(field);
  };

  // --- Countries ---
  const openAddCountry = () => {
    clearCountryErrors();
    setEditingCountry(null);
    setCountryForm({ name: '', iso_code: '', phone_code: '', currency: '', status: true });
    setCountryModal(true);
  };

  const openEditCountry = (c) => {
    clearCountryErrors();
    setEditingCountry(c);
    setCountryForm({ name: c.name || '', iso_code: c.iso_code || '', phone_code: c.phone_code || '', currency: c.currency || '', status: c.status ?? true });
    setCountryModal(true);
  };

  const handleSaveCountry = async () => {
    if (!validateCountry(countryForm)) return;
    setCountrySaving(true);
    try {
      if (editingCountry) {
        await updateCountry(editingCountry.id, countryForm);
      } else {
        await createCountry(countryForm);
      }
      setCountryModal(false);
      fetchCountries();
    } catch { /* ignore */ }
    setCountrySaving(false);
  };

  const handleDeleteCountry = async () => {
    await deleteCountry(countryDelete.id);
    setCountryDelete(null);
    fetchCountries();
  };

  // --- States ---
  const openAddState = () => {
    clearStateErrors();
    setEditingState(null);
    setStateForm({ country_id: selectedCountry, name: '', code: '', status: true });
    setStateModal(true);
  };

  const openEditState = (s) => {
    clearStateErrors();
    setEditingState(s);
    setStateForm({ country_id: s.country_id || selectedCountry, name: s.name || '', code: s.code || '', status: s.status ?? true });
    setStateModal(true);
  };

  const handleSaveState = async () => {
    if (!validateState(stateForm)) return;
    setStateSaving(true);
    try {
      if (editingState) {
        await updateState(editingState.id, stateForm);
      } else {
        await createState(stateForm);
      }
      setStateModal(false);
      if (selectedCountry) fetchStates({ country_id: selectedCountry });
    } catch { /* ignore */ }
    setStateSaving(false);
  };

  const handleDeleteState = async () => {
    await deleteState(stateDelete.id);
    setStateDelete(null);
    if (selectedCountry) fetchStates({ country_id: selectedCountry });
  };

  // --- Cities ---
  const openAddCity = () => {
    clearCityErrors();
    setEditingCity(null);
    setCityForm({ state_id: selectedState, name: '', status: true });
    setCityModal(true);
  };

  const openEditCity = (c) => {
    clearCityErrors();
    setEditingCity(c);
    setCityForm({ state_id: c.state_id || selectedState, name: c.name || '', status: c.status ?? true });
    setCityModal(true);
  };

  const handleSaveCity = async () => {
    if (!validateCity(cityForm)) return;
    setCitySaving(true);
    try {
      if (editingCity) {
        await updateCity(editingCity.id, cityForm);
      } else {
        await createCity(cityForm);
      }
      setCityModal(false);
      if (selectedState) fetchCities({ state_id: selectedState });
    } catch { /* ignore */ }
    setCitySaving(false);
  };

  const handleDeleteCity = async () => {
    await deleteCity(cityDelete.id);
    setCityDelete(null);
    if (selectedState) fetchCities({ state_id: selectedState });
  };

  const renderCountries = () => (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{countries.length} countries</p>
        <PermissionGuard permission="create locations">
          <AdminButton size="sm" onClick={openAddCountry}><Plus size={14} /> Add Country</AdminButton>
        </PermissionGuard>
      </div>
      {countries.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Globe} title="No countries yet" description="Add countries for your store locations." actionLabel="Add Country" onAction={openAddCountry} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Globe size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={c.status ? 'success' : 'danger'} className="text-[10px]">{c.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {c.iso_code && <AdminBadge variant="info" className="text-[10px]">{c.iso_code}</AdminBadge>}
                {c.phone_code && <AdminBadge variant="default" className="text-[10px]">+{c.phone_code}</AdminBadge>}
              </div>
              {c.currency && <p className="text-xs text-text-secondary mt-1">Currency: {c.currency}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit locations">
                  <button onClick={() => openEditCountry(c)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium"><Edit3 size={12} className="inline mr-1" /> Edit</button>
                </PermissionGuard>
                <PermissionGuard permission="delete locations">
                  <button onClick={() => setCountryDelete(c)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  const renderStates = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="w-64">
          <AdminSelect label="Select Country" value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(''); }} options={countries.map((c) => ({ value: c.id, label: c.name }))} placeholder="Choose a country" />
        </div>
        {selectedCountry && (
          <PermissionGuard permission="create locations">
            <AdminButton size="sm" onClick={openAddState}><Plus size={14} /> Add State</AdminButton>
          </PermissionGuard>
        )}
      </div>
      {!selectedCountry ? (
        <AdminCard>
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin size={40} className="text-text-secondary mb-3" />
            <p className="text-text-primary font-medium">Select a country</p>
            <p className="text-sm text-text-secondary mt-1">Choose a country above to view its states</p>
          </div>
        </AdminCard>
      ) : states.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={MapPin} title="No states yet" description="Add states for the selected country." actionLabel="Add State" onAction={openAddState} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((s) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={s.status ? 'success' : 'danger'} className="text-[10px]">{s.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{s.name}</h3>
              {s.code && <p className="text-xs text-text-secondary">Code: {s.code}</p>}
              <p className="text-xs text-text-secondary mt-1">{s.country?.name || ''}</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit locations">
                  <button onClick={() => openEditState(s)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium"><Edit3 size={12} className="inline mr-1" /> Edit</button>
                </PermissionGuard>
                <PermissionGuard permission="delete locations">
                  <button onClick={() => setStateDelete(s)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  const renderCities = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="w-64">
          <AdminSelect label="Select State" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} options={states.map((s) => ({ value: s.id, label: s.name }))} placeholder="Choose a state" />
        </div>
        {selectedState && (
          <PermissionGuard permission="create locations">
            <AdminButton size="sm" onClick={openAddCity}><Plus size={14} /> Add City</AdminButton>
          </PermissionGuard>
        )}
      </div>
      {!selectedState ? (
        <AdminCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 size={40} className="text-text-secondary mb-3" />
            <p className="text-text-primary font-medium">Select a state</p>
            <p className="text-sm text-text-secondary mt-1">Choose a state above to view its cities</p>
          </div>
        </AdminCard>
      ) : cities.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Building2} title="No cities yet" description="Add cities for the selected state." actionLabel="Add City" onAction={openAddCity} />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Building2 size={20} className="text-text-secondary" />
                </div>
                <AdminBadge variant={c.status ? 'success' : 'danger'} className="text-[10px]">{c.status ? 'Active' : 'Inactive'}</AdminBadge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{c.state?.name || ''}</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PermissionGuard permission="edit locations">
                  <button onClick={() => openEditCity(c)} className="px-2.5 py-1 rounded-lg bg-secondary text-text-secondary hover:bg-border text-xs font-medium"><Edit3 size={12} className="inline mr-1" /> Edit</button>
                </PermissionGuard>
                <PermissionGuard permission="delete locations">
                  <button onClick={() => setCityDelete(c)} className="px-2.5 py-1 rounded-lg bg-red-50 text-danger hover:bg-red-100 text-xs font-medium"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Locations</h1>
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

      {activeTab === 'countries' && renderCountries()}
      {activeTab === 'states' && renderStates()}
      {activeTab === 'cities' && renderCities()}

      {/* Country Modal */}
      <AdminModal isOpen={countryModal} onClose={() => setCountryModal(false)} title={editingCountry ? 'Edit Country' : 'Add Country'} size="md">
        <div className="space-y-4">
          <AdminInput label="Country Name" value={countryForm.name} onChange={handleChange(setCountryForm, clearCountryField)('name')} placeholder="e.g. India" required error={countryErrors.name} />
          <div className="grid grid-cols-3 gap-4">
            <AdminInput label="ISO Code" value={countryForm.iso_code} onChange={handleChange(setCountryForm, clearCountryField)('iso_code')} placeholder="e.g. IN" error={countryErrors.iso_code} />
            <AdminInput label="Phone Code" value={countryForm.phone_code} onChange={handleChange(setCountryForm, clearCountryField)('phone_code')} placeholder="e.g. 91" error={countryErrors.phone_code} />
            <AdminInput label="Currency" value={countryForm.currency} onChange={handleChange(setCountryForm, clearCountryField)('currency')} placeholder="e.g. INR" error={countryErrors.currency} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={countryForm.status} onChange={handleChange(setCountryForm)('status')} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setCountryModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveCountry} disabled={countrySaving}>{countrySaving ? 'Saving...' : editingCountry ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* State Modal */}
      <AdminModal isOpen={stateModal} onClose={() => setStateModal(false)} title={editingState ? 'Edit State' : 'Add State'} size="md">
        <div className="space-y-4">
          <AdminSelect label="Country" value={stateForm.country_id} onChange={handleChange(setStateForm)('country_id')} options={countries.map((c) => ({ value: c.id, label: c.name }))} />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="State Name" value={stateForm.name} onChange={handleChange(setStateForm, clearStateField)('name')} placeholder="e.g. Delhi" required error={stateErrors.name} />
            <AdminInput label="Code" value={stateForm.code} onChange={handleChange(setStateForm, clearStateField)('code')} placeholder="e.g. DL" error={stateErrors.code} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={stateForm.status} onChange={handleChange(setStateForm)('status')} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setStateModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveState} disabled={stateSaving}>{stateSaving ? 'Saving...' : editingState ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* City Modal */}
      <AdminModal isOpen={cityModal} onClose={() => setCityModal(false)} title={editingCity ? 'Edit City' : 'Add City'} size="md">
        <div className="space-y-4">
          <AdminSelect label="State" value={cityForm.state_id} onChange={handleChange(setCityForm)('state_id')} options={states.map((s) => ({ value: s.id, label: s.name }))} />
          <AdminInput label="City Name" value={cityForm.name} onChange={handleChange(setCityForm, clearCityField)('name')} placeholder="e.g. New Delhi" required error={cityErrors.name} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={cityForm.status} onChange={handleChange(setCityForm)('status')} className="accent-primary w-4 h-4" />
            <span className="text-sm text-text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setCityModal(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSaveCity} disabled={citySaving}>{citySaving ? 'Saving...' : editingCity ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog isOpen={!!countryDelete} onClose={() => setCountryDelete(null)} onConfirm={handleDeleteCountry} title="Delete Country" message={`Delete "${countryDelete?.name}"? This may also remove related states and cities.`} confirmLabel="Delete" variant="danger" />
      <AdminConfirmDialog isOpen={!!stateDelete} onClose={() => setStateDelete(null)} onConfirm={handleDeleteState} title="Delete State" message={`Delete "${stateDelete?.name}"? This may also remove related cities.`} confirmLabel="Delete" variant="danger" />
      <AdminConfirmDialog isOpen={!!cityDelete} onClose={() => setCityDelete(null)} onConfirm={handleDeleteCity} title="Delete City" message={`Delete "${cityDelete?.name}"?`} confirmLabel="Delete" variant="danger" />
    </motion.div>
  );
}
