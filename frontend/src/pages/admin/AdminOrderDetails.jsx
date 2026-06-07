import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminSelect from '../../components/admin/AdminSelect';
import AdminButton from '../../components/admin/AdminButton';

const orderData = {
  id: '#ORD-001',
  date: '2024-01-15',
  customer: {
    name: 'Sophia Chen',
    email: 'sophia@example.com',
    phone: '+1 (555) 123-4567',
  },
  shipping: {
    address: '123 Fashion Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
  },
  payment: {
    method: 'Credit Card',
    status: 'paid',
    total: 245.00,
    subtotal: 220.00,
    tax: 15.00,
    shipping: 10.00,
  },
  items: [
    { name: 'Crystal Resin Vase', qty: 1, price: 49.99 },
    { name: 'Silk Maxi Dress', qty: 1, price: 189.99 },
    { name: 'Boho Tassel Earrings', qty: 2, price: 34.99 },
  ],
  timeline: [
    { status: 'Order Placed', date: 'Jan 15, 2024 10:30 AM', icon: Clock, done: true },
    { status: 'Payment Confirmed', date: 'Jan 15, 2024 10:32 AM', icon: CheckCircle, done: true },
    { status: 'Processing', date: 'Jan 15, 2024 02:00 PM', icon: Package, done: true },
    { status: 'Shipped', date: 'Jan 16, 2024 09:00 AM', icon: Truck, done: true },
    { status: 'Delivered', date: 'Jan 18, 2024 11:20 AM', icon: CheckCircle, done: true },
  ],
};

const statusVariants = { paid: 'success', pending: 'warning', failed: 'danger' };

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [status, setStatus] = useState('delivered');

  const order = orderData;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{order.id}</h1>
            <p className="text-sm text-text-secondary">{order.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="ghost" size="sm">
            <Printer size={14} />
            Invoice
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Order Items</h3>
              <AdminBadge variant={statusVariants[order.payment.status]}>
                {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
              </AdminBadge>
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-semibold text-text-secondary">{item.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.done ? 'bg-green-50 text-green-600' : 'bg-secondary text-text-secondary'}`}>
                      <event.icon size={14} />
                    </div>
                    {i < order.timeline.length - 1 && <div className="w-0.5 h-8 bg-border/50" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${event.done ? 'text-text-primary' : 'text-text-secondary'}`}>{event.status}</p>
                    <p className="text-xs text-text-secondary">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Update Status</h3>
            <div className="space-y-3">
              <AdminSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
              <AdminButton fullWidth>Update Status</AdminButton>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Customer</h3>
            <div className="space-y-2">
              <p className="text-sm text-text-primary">{order.customer.name}</p>
              <p className="text-xs text-text-secondary">{order.customer.email}</p>
              <p className="text-xs text-text-secondary">{order.customer.phone}</p>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Shipping Address</h3>
            <div className="space-y-1">
              <p className="text-sm text-text-primary">{order.shipping.address}</p>
              <p className="text-xs text-text-secondary">{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p className="text-xs text-text-secondary">{order.shipping.country}</p>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">${order.payment.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary">${order.payment.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text-primary">${order.payment.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2">
                <span>Total</span>
                <span className="text-primary">${order.payment.total.toFixed(2)}</span>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </motion.div>
  );
}
