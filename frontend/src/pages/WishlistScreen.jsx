import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import { useAppContext } from "../context/AppContext";
import { products } from "../data/products";

export default function WishlistScreen() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useAppContext();

  const wishlistedProducts = products.filter((p) =>
    wishlist?.includes(p.id)
  );

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="px-5 py-4">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Start adding items you love"
          actionLabel="Explore Products"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Wishlist</h1>
        <span className="text-sm text-text-secondary">
          {wishlistedProducts.length} items
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {wishlistedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              discount={product.discount}
              isWishlisted={true}
              onToggleWishlist={() => toggleWishlist?.(product.id)}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
