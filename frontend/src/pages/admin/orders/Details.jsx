import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Package, Truck, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import AdminCard from '../../../components/admin/AdminCard';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminButton from '../../../components/admin/AdminButton';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';

const statusVariants = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'danger',
};

const paymentVariants = { paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info' };

const timelineIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: AlertTriangle,
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [assigningShipment, setAssigningShipment] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setOrder(res.data.order);
      setNewStatus(res.data.order.order_status || '');
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order.order_status) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignShipment = async () => {
    if (!trackingNumber || !courierName) return;
    setAssigningShipment(true);
    try {
      const res = await api.post(`/admin/orders/${id}/assign-shipment`, { tracking_number: trackingNumber, courier_name: courierName });
      setOrder(res.data);
      setShowShipmentForm(false);
      setTrackingNumber('');
      setCourierName('');
    } catch (err) {
      setError(err.message || 'Failed to assign shipment');
    } finally {
      setAssigningShipment(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/admin/orders/${id}/cancel`, { reason: cancelReason });
      setShowCancelDialog(false);
      setCancelReason('');
      fetchOrder();
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${id}/refund`);
      setShowRefundDialog(false);
      fetchOrder();
    } catch (err) {
      setError(err.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card p-5 h-48 animate-pulse" />
            <div className="admin-card p-5 h-64 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="admin-card p-5 h-32 animate-pulse" />
            <div className="admin-card p-5 h-24 animate-pulse" />
            <div className="admin-card p-5 h-24 animate-pulse" />
            <div className="admin-card p-5 h-40 animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error && !order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Order Not Found</h1>
        </div>
        <AdminCard>
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        </AdminCard>
      </motion.div>
    );
  }

  if (!order) return null;

  const timeline = (order.status_histories || []).map((h) => ({
    status: h.status.charAt(0).toUpperCase() + h.status.slice(1),
    date: formatDateTime(h.created_at),
    icon: timelineIcons[h.status] || Clock,
    done: true,
  }));

  if (timeline.length === 0) {
    timeline.push({
      status: 'Order Placed',
      date: formatDateTime(order.placed_at || order.created_at),
      icon: Clock,
      done: true,
    });
  }

  const isCancellable = !['cancelled', 'delivered', 'refunded'].includes(order.order_status);
  const isRefundable = order.order_status === 'delivered' || order.order_status === 'cancelled';
  const shipment = order.shipment;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{order.order_number}</h1>
            <p className="text-sm text-text-secondary">{formatDateTime(order.placed_at || order.created_at)}</p>
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
              <AdminBadge variant={paymentVariants[order.payment_status] || 'default'}>
                {(order.payment_status || '').charAt(0).toUpperCase() + (order.payment_status || '').slice(1)}
              </AdminBadge>
            </div>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-semibold text-text-secondary">
                        {(item.product?.name || item.name || '?').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.product?.name || item.name}</p>
                      <p className="text-xs text-text-secondary">
                        Qty: {item.quantity || item.qty} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency((item.price || 0) * (item.quantity || item.qty || 1))}
                  </p>
                </div>
              ))}
              {(order.items || []).length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">No items found</p>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.done ? 'bg-green-50 text-green-600' : 'bg-secondary text-text-secondary'}`}>
                      <event.icon size={14} />
                    </div>
                    {i < timeline.length - 1 && <div className="w-0.5 h-8 bg-border/50" />}
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
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={statusOptions}
              />
              <AdminButton
                fullWidth
                onClick={handleUpdateStatus}
                disabled={updatingStatus || !newStatus || newStatus === order.order_status}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Customer</h3>
            <div className="space-y-2">
              <p className="text-sm text-text-primary">{order.user?.name || 'N/A'}</p>
              <p className="text-xs text-text-secondary">{order.user?.email || 'N/A'}</p>
              <p className="text-xs text-text-secondary">{order.user?.phone || 'N/A'}</p>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Shipping Address</h3>
            {order.address_snapshot ? (
              <div className="space-y-1">
                <p className="text-sm text-text-primary">{order.address_snapshot.address}</p>
                <p className="text-xs text-text-secondary">
                  {[order.address_snapshot.city, order.address_snapshot.state, order.address_snapshot.zip].filter(Boolean).join(', ')}
                </p>
                <p className="text-xs text-text-secondary">{order.address_snapshot.country}</p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No address information</p>
            )}
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text-primary">{formatCurrency(order.shipping_charge)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.grand_total)}</span>
              </div>
              {order.coupon_code && (
                <p className="text-xs text-text-secondary pt-1">Coupon: {order.coupon_code}</p>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Shipment</h3>
            {shipment ? (
              <div className="space-y-2">
                <p className="text-sm text-text-primary">
                  Courier: <span className="font-medium">{shipment.courier_name}</span>
                </p>
                <p className="text-sm text-text-primary">
                  Tracking: <span className="font-medium">{shipment.tracking_number}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary mb-3">No shipment assigned</p>
            )}
            {!shipment && order.order_status !== 'cancelled' && order.order_status !== 'refunded' && (
              <>
                {showShipmentForm ? (
                  <div className="space-y-3">
                    <AdminInput
                      label="Tracking Number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                    <AdminInput
                      label="Courier Name"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. FedEx, BlueDart"
                    />
                    <div className="flex gap-2">
                      <AdminButton size="sm" onClick={handleAssignShipment} disabled={assigningShipment || !trackingNumber || !courierName}>
                        {assigningShipment ? 'Assigning...' : 'Assign'}
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => setShowShipmentForm(false)}>Cancel</AdminButton>
                    </div>
                  </div>
                ) : (
                  <AdminButton size="sm" variant="secondary" fullWidth onClick={() => setShowShipmentForm(true)}>
                    <Truck size={14} />
                    Assign Shipment
                  </AdminButton>
                )}
              </>
            )}
          </AdminCard>

          <div className="flex gap-2">
            {isCancellable && (
              <AdminButton variant="danger" fullWidth onClick={() => setShowCancelDialog(true)} disabled={cancelling}>
                <XCircle size={14} />
                Cancel Order
              </AdminButton>
            )}
            {isRefundable && (
              <AdminButton variant="secondary" fullWidth onClick={() => setShowRefundDialog(true)} disabled={refunding}>
                <AlertTriangle size={14} />
                Process Refund
              </AdminButton>
            )}
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => { setShowCancelDialog(false); setCancelReason(''); }}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmLabel={cancelling ? 'Cancelling...' : 'Cancel Order'}
      />

      <AdminConfirmDialog
        isOpen={showRefundDialog}
        onClose={() => setShowRefundDialog(false)}
        onConfirm={handleRefund}
        title="Process Refund"
        message="Are you sure you want to process a refund for this order?"
        confirmLabel={refunding ? 'Refunding...' : 'Process Refund'}
      />
    </motion.div>
  );
}
