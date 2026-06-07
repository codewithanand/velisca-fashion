import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import useCheckoutStore from '../../stores/checkout.store'

export default function OrderSuccessScreen() {
  const navigate = useNavigate()
  const { lastOrder } = useCheckoutStore()
  const [orderNumber] = useState(
    () => lastOrder?.order_number || `ORD-${Date.now().toString(36).toUpperCase()}`
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CheckCircle size={72} className="text-success" />
        </motion.div>

        <h1 className="heading-md mt-6">Order Confirmed!</h1>
        <p className="body-sm mt-2">Thank you for shopping with Velisca</p>

        <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl px-5 py-3 mt-6 shadow-sm">
          <p className="text-xs text-text-secondary">Order Number</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">{orderNumber}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-8"
        >
          <button
            onClick={() => navigate('/orders')}
            className="w-full h-14 rounded-2xl font-semibold text-base text-white bg-gradient-to-r from-primary to-primary-dark shadow-xl shadow-primary/25 transition-all duration-300 ease-out flex items-center justify-center gap-2.5 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            View Orders
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-3"
        >
          <button
            onClick={() => navigate('/home')}
            className="w-full h-14 rounded-2xl font-semibold text-base text-text-primary bg-white/90 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center justify-center gap-2.5 hover:bg-white hover:border-border/60 active:scale-[0.98]"
          >
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
