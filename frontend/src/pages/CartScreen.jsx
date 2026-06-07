import { Trash2, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import QuantitySelector from '../components/ui/QuantitySelector'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useAppContext } from '../context/AppContext'

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function CartScreen() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity } = useAppContext()

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const delivery = subtotal >= 999 ? 0 : 99
  const total = subtotal + delivery

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 pt-6 pb-4">
          <h1 className="heading-md">My Cart</h1>
        </div>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our collection and add items to your cart"
          actionLabel="Start Shopping"
          onAction={() => navigate('/home')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">My Cart</h1>
        <p className="body-sm mt-1">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-card rounded-2xl border border-border p-3 flex gap-3"
            >
              <div className="w-24 h-32 rounded-xl overflow-hidden bg-secondary shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-text-primary text-sm leading-tight truncate">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </div>
                  {item.size && (
                    <p className="text-xs text-text-secondary mt-0.5">Size: {item.size}</p>
                  )}
                  <p className="text-sm font-semibold text-text-primary mt-1">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <QuantitySelector
                  quantity={item.quantity}
                  min={1}
                  onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl px-4 pt-4 pb-8">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Delivery</span>
            {delivery === 0 ? (
              <span className="text-success font-medium">Free</span>
            ) : (
              <span className="text-text-primary font-medium">{formatPrice(delivery)}</span>
            )}
          </div>
          {delivery > 0 && subtotal < 999 && (
            <p className="text-xs text-text-secondary">
              Add {formatPrice(999 - subtotal)} more for free delivery
            </p>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between">
            <span className="text-text-primary font-semibold">Total</span>
            <span className="text-text-primary font-bold">{formatPrice(total)}</span>
          </div>
        </div>
        <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>
          Checkout
        </Button>
      </div>
    </div>
  )
}
