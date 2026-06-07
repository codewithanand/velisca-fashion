import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, IndianRupee, TrendingUp } from 'lucide-react';
import api from '../../../services/api';
import AdminCard from '../../../components/admin/AdminCard';
import AdminDataTable from '../../../components/admin/AdminDataTable';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminSelect from '../../../components/admin/AdminSelect';

const paymentVariants = { paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info' };
const statusVariants = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', params);
      setOrders(res.data.orders.data || []);
      if (res.data.orders.meta) {
        setTotalPages(res.data.orders.meta.last_page || 1);
      }
      if (res.data.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    { key: 'order_number', label: 'Order', render: (row) => (
      <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/admin/orders/${row.id}`)}>
        {row.order_number}
      </span>
    )},
    { key: 'customer', label: 'Customer', render: (row) => (
      <span>{row.user?.name || 'N/A'}</span>
    )},
    { key: 'items_count', label: 'Items', render: (row) => (
      <span>{row.items_count ?? '-'} items</span>
    )},
    { key: 'grand_total', label: 'Amount', render: (row) => (
      <span className="font-semibold">₹{Number(row.grand_total).toLocaleString('en-IN')}</span>
    )},
    { key: 'payment_status', label: 'Payment', render: (row) => (
      <AdminBadge variant={paymentVariants[row.payment_status] || 'default'}>
        {(row.payment_status || '').charAt(0).toUpperCase() + (row.payment_status || '').slice(1)}
      </AdminBadge>
    )},
    { key: 'order_status', label: 'Status', render: (row) => (
      <AdminBadge variant={statusVariants[row.order_status] || 'default'}>
        {(row.order_status || '').charAt(0).toUpperCase() + (row.order_status || '').slice(1)}
      </AdminBadge>
    )},
    { key: 'created_at', label: 'Date', render: (row) => (
      <span className="text-text-secondary">{formatDate(row.created_at)}</span>
    )},
    { key: 'actions', label: '', render: (row) => (
      <button onClick={() => navigate(`/admin/orders/${row.id}`)} className="admin-btn-ghost text-xs">
        View
      </button>
    )},
  ];

  const analyticsCards = [
    { label: 'Total Orders', value: analytics?.total_orders ?? orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Revenue', value: `₹${Number(analytics?.total_revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Order Value', value: `₹${Number(analytics?.avg_order_value || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Orders</h1>
        <p className="text-sm text-text-secondary">{orders.length} orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analyticsCards.map((card, i) => (
          <AdminCard key={i}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-xs text-text-secondary">{card.label}</p>
                <p className="text-lg font-bold text-text-primary">{card.value}</p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or customer..."
            className="admin-input flex-1"
          />
          <div className="w-full sm:w-44">
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'refunded', label: 'Refunded' },
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <AdminDataTable
          columns={columns}
          data={orders}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyTitle="No orders found"
          emptyDescription="No orders match your search criteria."
        />
      </AdminCard>
    </motion.div>
  );
}
