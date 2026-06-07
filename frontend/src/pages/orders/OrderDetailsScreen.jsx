import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'
import useOrderStore from '../../stores/orders.store'

const progressMap = {
  pending: 10,
  confirmed: 20,
  processing: 35,
  packed: 50,
  shipped: 65,
  delivered: 100,
  cancelled: 0,
  returned: 0,
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

const statusVariant = {
  pending: 'default',
  confirmed: 'default',
  processing: 'default',
  packed: 'default',
  shipped: 'new',
  delivered: 'discount',
  cancelled: 'default',
  returned: 'default',
}

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TimelineIcon({ status }) {
  if (status === 'delivered') return <CheckCircle size={18} className="text-success" />
  if (status === 'shipped') return <Truck size={18} className="text-primary" />
  if (status === 'cancelled' || status === 'returned') return <XCircle size={18} className="text-error" />
  return <Clock size={18} className="text-text-secondary" />
}

export default function OrderDetailsScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrder: order, loading, fetchOrder, cancelOrder, returnOrder } = useOrderStore()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOrder(id)
  }, [id, fetchOrder])

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await cancelOrder(id, reason)
      setCancelOpen(false)
      setReason('')
    } catch {
      alert('Failed to cancel order')
    }
    setActionLoading(false)
  }

  const handleReturn = async () => {
    setActionLoading(true)
    try {
      await returnOrder(id, reason)
      setReturnOpen(false)
      setReason('')
    } catch {
      alert('Failed to initiate return')
    }
    setActionLoading(false)
  }

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <Loader />
      </div>
    )
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const canReturn = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pb-8">
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="heading-md">Order Details</h1>
          <p className="body-sm text-text-secondary">#{order.order_number || `ORD-${order.id}`}</p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Badge variant={statusVariant[order.status] || 'default'}>
              {statusLabels[order.status] || order.status}
            </Badge>
            <span className="text-xs text-text-secondary">{formatDate(order.created_at)}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressMap[order.status] || 0}%` }}
            />
          </div>
        </motion.div>

        {order.status_histories?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold text-text-primary mb-3">Timeline</h3>
            <div className="space-y-0">
              {order.status_histories.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <TimelineIcon status={entry.status} />
                    </div>
                    {idx < order.status_histories.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border min-h-[24px]" />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {statusLabels[entry.status] || entry.status}
                    </p>
                    <p className="text-xs text-text-secondary">{formatDate(entry.created_at || entry.timestamp)}</p>
                    {entry.note && <p className="text-xs text-text-secondary mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold text-text-primary mb-3">Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => {
              const img = item.variant_snapshot?.image || 'https://placehold.co/100x140/E2E8F0/94A3B8?text=Item'
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                    <img src={img} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.product_name_snapshot}</p>
                    {item.variant_snapshot && (
                      <p className="text-xs text-text-secondary">
                        {[item.variant_snapshot.size, item.variant_snapshot.color].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-text-primary mt-1">{formatPrice(item.price_snapshot)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {order.address_snapshot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold text-text-primary mb-2">Delivery Address</h3>
            <p className="text-sm font-medium text-text-primary">{order.address_snapshot.name}</p>
            <p className="text-sm text-text-secondary">{order.address_snapshot.phone}</p>
            <p className="text-sm text-text-secondary">{order.address_snapshot.address_line_1}</p>
            {order.address_snapshot.address_line_2 && (
              <p className="text-sm text-text-secondary">{order.address_snapshot.address_line_2}</p>
            )}
            <p className="text-sm text-text-secondary">
              {order.address_snapshot.city}, {order.address_snapshot.state} - {order.address_snapshot.postal_code}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold text-text-primary mb-3">Payment</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Method</span>
              <span className="text-text-primary capitalize">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-success' : 'text-text-primary'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Delivery</span>
              <span className="text-text-primary">{formatPrice(order.shipping_charge || 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount</span>
                <span className="text-success">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span className="text-text-primary">Total</span>
              <span className="text-text-primary">{formatPrice(order.grand_total)}</span>
            </div>
          </div>
        </motion.div>

        {order.tracking_number && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Tracking</p>
              <p className="text-xs text-text-secondary">
                {order.tracking_courier && `${order.tracking_courier} - `}{order.tracking_number}
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          {canCancel && (
            <button
              onClick={() => setCancelOpen(true)}
              disabled={actionLoading}
              className="flex-1 h-14 rounded-2xl font-semibold text-base border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-all duration-300 ease-out flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setReturnOpen(true)}
              disabled={actionLoading}
              className="flex-1 h-14 rounded-2xl font-semibold text-base border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-all duration-300 ease-out flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Return / Replace
            </button>
          )}
        </div>

        {(cancelOpen || returnOpen) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 space-y-3 shadow-sm"
          >
            <h3 className="font-semibold text-text-primary">
              {cancelOpen ? 'Cancel Order' : 'Return / Replace'}
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-border/60 p-3 text-sm text-text-primary placeholder:text-text-secondary/50 resize-none focus:outline-none focus:border-primary transition-all duration-300"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setCancelOpen(false); setReturnOpen(false); setReason('') }}
                disabled={actionLoading}
              >
                Back
              </Button>
              <button
                onClick={cancelOpen ? handleCancel : handleReturn}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-primary to-primary-dark shadow-lg shadow-primary/25 transition-all duration-300 ease-out flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
