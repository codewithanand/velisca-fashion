import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminCard from '../../components/admin/AdminCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminSelect from '../../components/admin/AdminSelect';

const initialOrders = [
  { id: '#ORD-001', customer: 'Sophia Chen', amount: 245.00, payment: 'paid', delivery: 'delivered', date: '2024-01-15', items: 3 },
  { id: '#ORD-002', customer: 'Emma Wilson', amount: 189.00, payment: 'paid', delivery: 'processing', date: '2024-01-14', items: 2 },
  { id: '#ORD-003', customer: 'Olivia Johnson', amount: 420.00, payment: 'pending', delivery: 'pending', date: '2024-01-14', items: 5 },
  { id: '#ORD-004', customer: 'Isabella Brown', amount: 75.00, payment: 'paid', delivery: 'shipped', date: '2024-01-13', items: 1 },
  { id: '#ORD-005', customer: 'Mia Davis', amount: 310.00, payment: 'paid', delivery: 'delivered', date: '2024-01-12', items: 4 },
  { id: '#ORD-006', customer: 'Charlotte Miller', amount: 560.00, payment: 'failed', delivery: 'cancelled', date: '2024-01-11', items: 6 },
  { id: '#ORD-007', customer: 'Amelia Garcia', amount: 125.00, payment: 'paid', delivery: 'shipped', date: '2024-01-10', items: 2 },
];

const paymentVariants = { paid: 'success', pending: 'warning', failed: 'danger' };
const deliveryVariants = { delivered: 'success', shipped: 'primary', processing: 'info', pending: 'warning', cancelled: 'danger' };

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.delivery === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'id', label: 'Order', render: (row) => (
      <span className="font-medium text-primary">{row.id}</span>
    )},
    { key: 'customer', label: 'Customer' },
    { key: 'items', label: 'Items', render: (row) => <span>{row.items} items</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-semibold">${row.amount.toFixed(2)}</span> },
    { key: 'payment', label: 'Payment', render: (row) => (
      <AdminBadge variant={paymentVariants[row.payment]}>
        {row.payment.charAt(0).toUpperCase() + row.payment.slice(1)}
      </AdminBadge>
    )},
    { key: 'delivery', label: 'Delivery', render: (row) => (
      <AdminBadge variant={deliveryVariants[row.delivery]}>
        {row.delivery.charAt(0).toUpperCase() + row.delivery.slice(1)}
      </AdminBadge>
    )},
    { key: 'date', label: 'Date', render: (row) => <span className="text-text-secondary">{row.date}</span> },
    { key: 'actions', label: '', render: (row) => (
      <button onClick={() => navigate(`/admin/orders/${row.id}`)} className="admin-btn-ghost text-xs">
        View
      </button>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Orders</h1>
        <p className="text-sm text-text-secondary">{orders.length} orders total</p>
      </div>

      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by ID or customer..."
            className="admin-input flex-1"
          />
          <div className="w-full sm:w-44">
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>
        <AdminDataTable
          columns={columns}
          data={filtered}
          emptyTitle="No orders found"
          emptyDescription="No orders match your search criteria."
        />
      </AdminCard>
    </motion.div>
  );
}
