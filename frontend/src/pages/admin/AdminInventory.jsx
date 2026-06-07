import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PackageOpen } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';

const initialItems = [
  { id: 1, name: 'Crystal Resin Vase', sku: 'RS-001', category: 'Resin Art', stock: 23, threshold: 10, status: 'in-stock' },
  { id: 2, name: 'Silk Maxi Dress', sku: 'DR-024', category: 'Fashion', stock: 12, threshold: 15, status: 'low-stock' },
  { id: 3, name: 'Boho Tassel Earrings', sku: 'BE-112', category: 'Accessories', stock: 45, threshold: 10, status: 'in-stock' },
  { id: 4, name: 'Handmade Ceramic Mug', sku: 'CM-008', category: 'Resin Art', stock: 0, threshold: 10, status: 'out-of-stock' },
  { id: 5, name: 'Leather Tote Bag', sku: 'TB-045', category: 'Accessories', stock: 8, threshold: 10, status: 'low-stock' },
  { id: 6, name: 'Wool Blend Scarf', sku: 'SC-031', category: 'Fashion', stock: 18, threshold: 10, status: 'in-stock' },
  { id: 7, name: 'Resin Coaster Set', sku: 'CS-004', category: 'Resin Art', stock: 0, threshold: 20, status: 'out-of-stock' },
  { id: 8, name: 'Gold Hoop Earrings', sku: 'BE-045', category: 'Accessories', stock: 32, threshold: 10, status: 'in-stock' },
];

export default function AdminInventory() {
  const [items] = useState(initialItems);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const lowStockCount = items.filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length;

  const statusBadge = {
    'in-stock': { variant: 'success', label: 'In Stock' },
    'low-stock': { variant: 'warning', label: 'Low Stock' },
    'out-of-stock': { variant: 'danger', label: 'Out of Stock' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Inventory</h1>
          <p className="text-sm text-text-secondary">{items.length} products tracked</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm">
            <AlertTriangle size={14} />
            {lowStockCount} low stock alerts
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'
            }`}
          >
            {f.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <PackageOpen size={18} className="text-text-secondary" />
              </div>
              <AdminBadge variant={statusBadge[item.status].variant}>
                {statusBadge[item.status].label}
              </AdminBadge>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">{item.name}</h3>
            <p className="text-xs text-text-secondary">{item.sku} • {item.category}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-text-primary">{item.stock}</p>
                <p className="text-xs text-text-secondary">in stock</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Min: {item.threshold}</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-secondary rounded-full h-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  item.stock === 0 ? 'bg-danger' : item.stock <= item.threshold ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(100, (item.stock / (item.threshold * 2)) * 100)}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
