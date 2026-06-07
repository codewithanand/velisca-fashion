import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../../components/ui/ProductCard'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import useWishlistStore from '../../stores/wishlist.store'

export default function WishlistScreen() {
  const navigate = useNavigate()
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <div className="px-5 py-4">
          <Loader />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <div className="px-5 py-4">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Start adding items you love"
            actionLabel="Explore Products"
            onAction={() => navigate('/home')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Wishlist</h1>
        <span className="text-sm text-text-secondary">
          {items.length} item{items.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => {
          const product = item.product || {}
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                image={product.primaryImage || product.image || 'https://placehold.co/300x400/E2E8F0/94A3B8?text=Item'}
                name={product.name || 'Product'}
                price={product.sale_price || product.price || 0}
                rating={product.rating || 0}
                discount={product.discount || undefined}
                isWishlisted={true}
                onToggleWishlist={() => removeFromWishlist(item.id)}
                onClick={() => navigate(`/product/${item.product_id}`)}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  </div>
  )
}
