import { useEffect } from 'react'
import { Trash2, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import QuantitySelector from '../../components/ui/QuantitySelector'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import useCartStore from '../../stores/cart.store'

const PLACEHOLDER = 'https://placehold.co/100x140/E2E8F0/94A3B8?text=Item'

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function CartScreen() {
  const navigate = useNavigate()
  const { items, summary, loading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <div className="px-4 pt-6 pb-4">
          <h1 className="heading-md">My Cart</h1>
        </div>
        <Loader />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pb-36">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">My Cart</h1>
        <p className="body-sm mt-1">{items.length} item{items.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const img = item.variant_snapshot?.image || PLACEHOLDER
            const price = item.display_price || formatPrice(item.price_snapshot)
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl border border-border/60 p-3 flex gap-3 shadow-sm"
              >
                <div className="w-24 h-32 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <img src={img} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-text-primary text-sm leading-tight truncate">
                        {item.product_name_snapshot}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Trash2 size={16} className="text-error" />
                      </button>
                    </div>
                    {item.variant_snapshot && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {[item.variant_snapshot.size, item.variant_snapshot.color].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-text-primary mt-1">{price}</p>
                  </div>
                  <QuantitySelector
                    quantity={item.quantity}
                    min={1}
                    onIncrease={() => updateItem(item.id, item.quantity + 1)}
                    onDecrease={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                  />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border/60 rounded-t-3xl shadow-lg px-4 pt-4 pb-8">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary font-medium">{formatPrice(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Delivery</span>
            {summary.shipping_charge === 0 ? (
              <span className="text-success font-medium">Free</span>
            ) : (
              <span className="text-text-primary font-medium">{formatPrice(summary.shipping_charge)}</span>
            )}
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Discount</span>
              <span className="text-success font-medium">-{formatPrice(summary.discount)}</span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between">
            <span className="text-text-primary font-semibold">Total</span>
            <span className="text-text-primary font-bold">{formatPrice(summary.grand_total)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full h-14 rounded-2xl font-semibold text-base text-white bg-gradient-to-r from-primary to-primary-dark shadow-xl shadow-primary/25 transition-all duration-300 ease-out flex items-center justify-center gap-2.5 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
