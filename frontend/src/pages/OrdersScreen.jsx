import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import OrderCard from '../components/ui/OrderCard'
import EmptyState from '../components/ui/EmptyState'
import { orders } from '../data/orders'

const progressMap = {
  pending: 10,
  processing: 35,
  shipped: 65,
  delivered: 100,
  cancelled: 0,
}

export default function OrdersScreen() {
  const navigate = useNavigate()
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">My Orders</h1>
        <p className="body-sm mt-1">{orders.length} order{orders.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        {orders.map((order, index) => {
          const firstItem = order.items[0]
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <OrderCard
                image={firstItem.image}
                name={firstItem.name + (order.items.length > 1 ? ` +${order.items.length - 1} more` : '')}
                price={order.finalAmount}
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
