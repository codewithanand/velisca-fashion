import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";

const formatPrice = (p) => `₹${p.toLocaleString("en-IN")}`;

export default function ProductCard({
  image,
  name,
  price,
  rating,
  discount,
  isWishlisted,
  onToggleWishlist,
  onClick,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-red-50 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-text-secondary"}
          />
        </button>
      </div>
      <h3 className="font-medium text-text-primary truncate">{name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="font-semibold text-text-primary">{formatPrice(price)}</span>
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-star text-star" />
          <span className="text-sm text-text-secondary">{rating}</span>
        </div>
      </div>
    </motion.div>
  );
}
