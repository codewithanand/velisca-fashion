import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PackageOpen, Search } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminPagination from '../../../components/admin/AdminPagination';
import api from '../../../services/api';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 20, last_page: 1 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, per_page: 20 };
        if (filter !== 'all') params.stock_status = filter;
        if (search) params.search = search;
        const res = await api.get('/admin/products', params);
        const data = res.data;
        setItems(data?.products?.data || data?.products || []);
        if (data?.meta) {
          setPagination({
            total: data.meta.total, page: data.meta.page, per_page: data.meta.per_page, last_page: data.meta.last_page,
          });
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [page, filter, search]);

  const lowStockCount = items.filter((i) => i.is_low_stock || i.is_out_of_stock).length;

  const statusBadge = {
    in_stock: { variant: 'success', label: 'In Stock' },
    low_stock: { variant: 'warning', label: 'Low Stock' },
    out_of_stock: { variant: 'danger', label: 'Out of Stock' },
  };

  const getStockStatus = (item) => {
    if (item.is_out_of_stock) return 'out_of_stock';
    if (item.is_low_stock) return 'low_stock';
    return 'in_stock';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Inventory</h1>
          <p className="text-sm text-text-secondary">{pagination.total} products tracked</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm">
            <AlertTriangle size={14} />
            {lowStockCount} need attention
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="admin-input pl-9 w-full" />
        </div>
        <div className="flex gap-2">
          {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
              {f.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const status = getStockStatus(item);
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen size={18} className="text-text-secondary" />
                      )}
                    </div>
                    <AdminBadge variant={statusBadge[status].variant}>{statusBadge[status].label}</AdminBadge>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{item.name}</h3>
                  <p className="text-xs text-text-secondary">{item.sku || '—'} • {item.category?.name || 'Uncategorized'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-bold ${item.is_out_of_stock ? 'text-danger' : item.is_low_stock ? 'text-warning' : 'text-text-primary'}`}>{item.stock}</p>
                      <p className="text-xs text-text-secondary">in stock</p>
                    </div>
                    {item.has_sale && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-primary">₹{item.display_price?.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary line-through">₹{item.price?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 w-full bg-secondary rounded-full h-1.5">
                    <div className={`h-full rounded-full transition-all ${item.is_out_of_stock ? 'bg-danger' : item.is_low_stock ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {pagination.last_page > 1 && (
            <div className="flex justify-center">
              <AdminPagination page={pagination.page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />
            </div>
          )}

          {items.length === 0 && (
            <AdminCard>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PackageOpen size={40} className="text-text-secondary mb-3" />
                <p className="text-text-primary font-medium">No inventory items found</p>
                <p className="text-sm text-text-secondary mt-1">Try adjusting your search or filters.</p>
              </div>
            </AdminCard>
          )}
        </>
      )}
    </motion.div>
  );
}
