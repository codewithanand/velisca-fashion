import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import OrderCard from '../../components/ui/OrderCard'
import EmptyState from '../../components/ui/EmptyState'
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

export default function OrdersScreen() {
  const navigate = useNavigate()
  const { orders, loading, fetchOrders } = useOrderStore()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <div className="px-4 pt-6 pb-4">
          <h1 className="heading-md">My Orders</h1>
        </div>
        <Loader />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <div className="px-4 pt-6 pb-4">
          <h1 className="heading-md">My Orders</h1>
        </div>
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Your order history will appear here"
          actionLabel="Start Shopping"
          onAction={() => navigate('/home')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">My Orders</h1>
        <p className="body-sm mt-1">{orders.length} order{orders.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        {orders.map((order, index) => {
          const firstItem = order.items?.[0] || {}
          const img = firstItem.variant_snapshot?.image || firstItem.product?.primaryImage || 'https://placehold.co/100x140/E2E8F0/94A3B8?text=Item'
          const name = firstItem.product_name_snapshot || firstItem.product?.name || 'Product'
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="cursor-pointer"
            >
              <OrderCard
                image={img}
                name={name + (order.items?.length > 1 ? ` +${order.items.length - 1} more` : '')}
                price={order.grand_total || order.final_amount || 0}
                status={order.status}
                progress={progressMap[order.status]}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
