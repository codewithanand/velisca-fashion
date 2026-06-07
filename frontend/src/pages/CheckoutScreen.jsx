import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Banknote } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import { useAppContext } from '../context/AppContext'

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when delivered' },
]

export default function CheckoutScreen() {
  const navigate = useNavigate()
  const { cart } = useAppContext()
  const [payment, setPayment] = useState('upi')

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const delivery = subtotal >= 999 ? 0 : 99
  const total = subtotal + delivery

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">Checkout</h1>
      </div>

      <div className="px-4 space-y-6">
        <section>
          <h2 className="heading-sm mb-3">Delivery Address</h2>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-text-primary">Priya Sharma</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  42, Lake View Apartments, Sector 14, Rohini
                </p>
                <p className="text-sm text-text-secondary">
                  New Delhi, Delhi - 110085
                </p>
                <p className="text-sm text-text-secondary mt-1">+91-9876543210</p>
              </div>
              <button className="text-sm font-medium text-primary shrink-0 ml-2">
                Change
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="heading-sm mb-3">Payment Method</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const selected = payment === method.id
              return (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPayment(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selected ? 'bg-primary text-white' : 'bg-secondary text-text-secondary'
                    }`}
                  >
                    <method.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-text-primary">{method.label}</p>
                    <p className="text-xs text-text-secondary">{method.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="heading-sm mb-3">Order Summary</h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{item.product.name}</p>
                  <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-text-primary shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Delivery</span>
              <span className={delivery === 0 ? 'text-success font-medium' : 'text-text-primary'}>
                {delivery === 0 ? 'Free' : formatPrice(delivery)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-text-primary">Total</span>
              <span className="text-text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl px-4 pt-4 pb-6">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/order-success')}
        >
          Place Order - {formatPrice(total)}
        </Button>
      </div>
    </div>
  )
}
