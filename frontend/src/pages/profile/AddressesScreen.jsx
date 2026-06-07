import { useEffect, useState } from 'react'
import { MapPin, Plus, Edit3, Trash2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import useAddressStore from '../../stores/addresses.store'

const emptyForm = {
  name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  address_type: 'home',
  is_default: false,
}

export default function AddressesScreen() {
  const { addresses, loading, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefault } = useAddressStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setShowForm(false)
    setErrors({})
  }

  const openEdit = (addr) => {
    setForm({
      name: addr.name || '',
      phone: addr.phone || '',
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postal_code: addr.postal_code || '',
      country: addr.country || 'India',
      address_type: addr.address_type || 'home',
      is_default: addr.is_default || false,
    })
    setEditingId(addr.id)
    setShowForm(true)
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Invalid phone number'
    if (!form.address_line_1.trim()) e.address_line_1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.postal_code.trim()) e.postal_code = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.postal_code.trim())) e.postal_code = 'Invalid pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address_line_1: form.address_line_1.trim(),
        address_line_2: form.address_line_2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country,
        address_type: form.address_type,
        is_default: form.is_default,
      }
      if (editingId) {
        await updateAddress(editingId, data)
      } else {
        await createAddress(data)
      }
      resetForm()
    } catch {
      alert('Failed to save address')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id)
    }
  }

  if (loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pb-8">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="heading-md">My Addresses</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
        >
          <Plus size={20} className="text-text-primary" />
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <EmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Add a delivery address for faster checkout"
          actionLabel="Add Address"
          onAction={() => { resetForm(); setShowForm(true) }}
        />
      ) : (
        <div className="px-4 space-y-3">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{addr.name}</p>
                      {addr.is_default && <Star size={14} className="fill-star text-star" />}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{addr.phone}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{addr.address_line_1}</p>
                    {addr.address_line_2 && <p className="text-sm text-text-secondary">{addr.address_line_2}</p>}
                    <p className="text-sm text-text-secondary">
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <span className="inline-block mt-1 text-[10px] bg-secondary text-text-secondary font-medium px-2 py-0.5 rounded-full capitalize">
                      {addr.address_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  {!addr.is_default && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Star size={14} />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1.5 text-sm text-error hover:text-red-600 transition-colors ml-auto"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 mt-4"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 space-y-4 shadow-sm">
              <h3 className="font-semibold text-text-primary">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                />
                <Input
                  label="Phone"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                />
              </div>

              <Input
                label="Address Line 1"
                placeholder="House / Flat / Street"
                value={form.address_line_1}
                onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
                error={errors.address_line_1}
              />
              <Input
                label="Address Line 2 (Optional)"
                placeholder="Landmark / Area"
                value={form.address_line_2}
                onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  error={errors.city}
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  error={errors.state}
                />
                <Input
                  label="Pincode"
                  placeholder="400001"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  error={errors.postal_code}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, address_type: 'home' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.address_type === 'home'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/30'
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, address_type: 'work' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.address_type === 'work'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/30'
                  }`}
                >
                  Work
                </button>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" fullWidth onClick={resetForm} disabled={saving}>
                  Cancel
                </Button>
                <Button fullWidth onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
