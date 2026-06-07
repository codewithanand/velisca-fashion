import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, CreditCard, Truck, Search, Globe } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminButton from '../../../components/admin/AdminButton';

const sections = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Search },
];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');

  const [general, setGeneral] = useState({
    storeName: 'Velisca',
    storeEmail: 'hello@velisca.com',
    storePhone: '+1 (555) 000-0000',
    address: '123 Fashion Avenue',
    currency: 'USD',
    timezone: 'UTC-5',
  });

  const [payment, setPayment] = useState({
    methods: ['stripe', 'paypal'],
    stripeKey: 'sk_live_...',
    paypalClient: '...',
    taxRate: '8',
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: '50',
    standardRate: '5.99',
    expressRate: '14.99',
    processingTime: '1-2',
  });

  const [seo, setSeo] = useState({
    metaTitle: 'Velisca - Wear Your Aura',
    metaDescription: 'Discover luxury fashion and resin art...',
    googleAnalytics: 'UA-...',
  });

  const forms = { general, payment, shipping, seo };
  const setters = { general: setGeneral, payment: setPayment, shipping: setShipping, seo: setSeo };

  const handleChange = (section, field) => (e) => {
    setters[section]((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    // API call
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your store settings</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === sec.id ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'
            }`}
          >
            <sec.icon size={16} />
            {sec.label}
          </button>
        ))}
      </div>

      <AdminCard>
        {activeSection === 'general' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Store Name" value={general.storeName} onChange={handleChange('general', 'storeName')} />
              <AdminInput label="Store Email" type="email" value={general.storeEmail} onChange={handleChange('general', 'storeEmail')} />
              <AdminInput label="Phone" value={general.storePhone} onChange={handleChange('general', 'storePhone')} />
              <AdminInput label="Address" value={general.address} onChange={handleChange('general', 'address')} />
              <AdminSelect label="Currency" value={general.currency} onChange={handleChange('general', 'currency')}
                options={[{ value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }]} />
              <AdminSelect label="Timezone" value={general.timezone} onChange={handleChange('general', 'timezone')}
                options={[{ value: 'UTC-5', label: 'UTC-5 (EST)' }, { value: 'UTC+0', label: 'UTC+0' }, { value: 'UTC+1', label: 'UTC+1 (CET)' }]} />
            </div>
          </div>
        )}

        {activeSection === 'payment' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Payment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Stripe Secret Key" type="password" value={payment.stripeKey} onChange={handleChange('payment', 'stripeKey')} />
              <AdminInput label="PayPal Client ID" type="password" value={payment.paypalClient} onChange={handleChange('payment', 'paypalClient')} />
              <AdminInput label="Tax Rate (%)" type="number" value={payment.taxRate} onChange={handleChange('payment', 'taxRate')} />
            </div>
          </div>
        )}

        {activeSection === 'shipping' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Shipping Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Free Shipping Threshold ($)" type="number" value={shipping.freeShippingThreshold} onChange={handleChange('shipping', 'freeShippingThreshold')} />
              <AdminInput label="Standard Rate ($)" type="number" value={shipping.standardRate} onChange={handleChange('shipping', 'standardRate')} />
              <AdminInput label="Express Rate ($)" type="number" value={shipping.expressRate} onChange={handleChange('shipping', 'expressRate')} />
              <AdminInput label="Processing Time (days)" value={shipping.processingTime} onChange={handleChange('shipping', 'processingTime')} />
            </div>
          </div>
        )}

        {activeSection === 'seo' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <AdminInput label="Meta Title" value={seo.metaTitle} onChange={handleChange('seo', 'metaTitle')} />
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Meta Description</label>
                <textarea value={seo.metaDescription} onChange={handleChange('seo', 'metaDescription')} rows={3} className="admin-input resize-none" />
              </div>
              <AdminInput label="Google Analytics ID" value={seo.googleAnalytics} onChange={handleChange('seo', 'googleAnalytics')} />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-border/50 mt-6">
          <AdminButton onClick={handleSave}>
            <Save size={16} />
            Save Settings
          </AdminButton>
        </div>
      </AdminCard>
    </motion.div>
  );
}
