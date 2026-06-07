import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function OrderSuccessScreen() {
  const navigate = useNavigate()
  const [orderNumber] = useState(
    () => 'ORD-' + Date.now().toString(36).toUpperCase()
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
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

        <div className="bg-card border border-border rounded-2xl px-5 py-3 mt-6">
          <p className="text-xs text-text-secondary">Order Number</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">{orderNumber}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-8"
        >
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/home')}
          >
            Continue Shopping
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
