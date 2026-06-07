import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Banknote, MapPin, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import useCartStore from '../../stores/cart.store'
import useAddressStore from '../../stores/addresses.store'
import useCheckoutStore from '../../stores/checkout.store'

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
  const { items, summary, fetchCart } = useCartStore()
  const { addresses, loading: addrLoading, fetchAddresses } = useAddressStore()
  const { placing, fetchSummary, placeOrder } = useCheckoutStore()

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [payment, setPayment] = useState('upi')
  const [error, setError] = useState(null)
  const initRef = useRef(false)

  useEffect(() => {
    fetchCart()
    fetchSummary()
    fetchAddresses()
  }, [fetchCart, fetchSummary, fetchAddresses])

  useEffect(() => {
    if (addresses.length > 0 && !initRef.current) {
      initRef.current = true
      const def = addresses.find((a) => a.is_default)
      setSelectedAddress(def ? def.id : addresses[0].id)
    }
  }, [addresses])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address')
      return
    }
    setError(null)
    try {
      await placeOrder({ address_id: selectedAddress, payment_method: payment })
      navigate('/order-success')
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pb-36">
      {placing && <Loader fullScreen />}

      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">Checkout</h1>
      </div>

      <div className="px-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-sm">Delivery Address</h2>
            <button
              onClick={() => navigate('/addresses')}
              className="text-sm font-medium text-primary flex items-center gap-1"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>

          {addrLoading ? (
            <Loader />
          ) : addresses.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <MapPin size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No addresses saved</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/addresses')}>
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => {
                const selected = selectedAddress === addr.id
                return (
                  <motion.button
                    key={addr.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`w-full text-left bg-white/95 backdrop-blur-sm border-2 rounded-2xl p-4 transition-colors shadow-sm ${
                      selected ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          selected ? 'border-primary' : 'border-border'
                        }`}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text-primary">{addr.name}</p>
                          {addr.is_default && (
                            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5">{addr.phone}</p>
                        <p className="text-sm text-text-secondary mt-0.5">{addr.address_line_1}</p>
                        {addr.address_line_2 && (
                          <p className="text-sm text-text-secondary">{addr.address_line_2}</p>
                        )}
                        <p className="text-sm text-text-secondary">
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                        <span className="inline-block mt-1 text-[10px] bg-secondary text-text-secondary font-medium px-2 py-0.5 rounded-full capitalize">
                          {addr.address_type}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
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
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors shadow-sm ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 bg-white/95 backdrop-blur-sm hover:border-primary/30'
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
          <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl p-4 space-y-3 shadow-sm">
            {items.map((item) => {
              const img = item.variant_snapshot?.image || 'https://placehold.co/100x140/E2E8F0/94A3B8?text=Item'
              const price = item.display_price || formatPrice(item.price_snapshot)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <img src={img} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{item.product_name_snapshot}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-text-primary shrink-0">
                    {price}
                  </p>
                </div>
              )
            })}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Delivery</span>
              <span className={summary.shipping_charge === 0 ? 'text-success font-medium' : 'text-text-primary'}>
                {summary.shipping_charge === 0 ? 'Free' : formatPrice(summary.shipping_charge)}
              </span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount</span>
                <span className="text-success font-medium">-{formatPrice(summary.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span className="text-text-primary">Total</span>
              <span className="text-text-primary">{formatPrice(summary.grand_total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border/60 rounded-t-3xl shadow-lg px-4 pt-4 pb-6">
        {error && (
          <p className="text-sm text-error text-center mb-2">{error}</p>
        )}
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full h-14 rounded-2xl font-semibold text-base text-white bg-gradient-to-r from-primary to-primary-dark shadow-xl shadow-primary/25 transition-all duration-300 ease-out flex items-center justify-center gap-2.5 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {placing ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Placing Order...
            </span>
          ) : (
            `Place Order - ${formatPrice(summary.grand_total)}`
          )}
        </button>
      </div>
    </div>
  )
}
