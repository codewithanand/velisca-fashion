import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Heart,
  Share2,
  Star,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import SizeSelector from "../components/ui/SizeSelector";
import ColorSelector from "../components/ui/ColorSelector";
import ReviewCard from "../components/ui/ReviewCard";
import ProductCard from "../components/ui/ProductCard";
import { useAppContext } from "../context/AppContext";
import { products } from "../data/products";
import { reviews } from "../data/reviews";

export default function ProductDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useAppContext();

  const product = products.find((p) => p.id === Number(id));
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === Number(id)),
    [id]
  );

  const relatedProducts = useMemo(
    () =>
      products.filter(
        (p) => p.category === product?.category && p.id !== product?.id
      ),
    [product]
  );

  if (!product) {
    return (
      <div className="px-5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-6"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <p className="text-text-secondary text-center py-16">
          Product not found
        </p>
      </div>
    );
  }

  const inWishlist = wishlist?.includes(product.id);

  return (
    <div className="pb-24">
      {/* Image Carousel */}
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={product.images[currentImage] || product.image}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          {product.discount && (
            <Badge variant="discount" className="absolute top-4 left-4">
              -{product.discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="new" className="absolute top-4 left-4">
              New
            </Badge>
          )}
          {/* Dot indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentImage ? "bg-white w-5" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>

        {/* Wishlist & Share */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => toggleWishlist?.(product.id)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Heart
              size={18}
              className={
                inWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-text-secondary"
              }
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Share2 size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-5 pt-5 space-y-5">
        {/* Name & Price */}
        <div>
          <h1 className="heading-lg text-text-primary font-bold text-2xl">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-text-primary">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-text-secondary line-through">
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <Badge variant="discount">{product.discount}% off</Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-star text-star" />
            <span className="font-semibold text-text-primary">
              {product.rating}
            </span>
          </div>
          <span className="text-text-secondary text-sm">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {product.description}
        </p>

        {/* Size Selector */}
        {product.sizes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Select Size
            </h4>
            <SizeSelector
              sizes={product.sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>
        )}

        {/* Color Selector */}
        {product.colors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Select Color
            </h4>
            <ColorSelector
              colors={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>
        )}

        {/* Product Details Accordion */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-text-primary">
              Product Details
            </span>
            {detailsOpen ? (
              <ChevronUp size={18} className="text-text-secondary" />
            ) : (
              <ChevronDown size={18} className="text-text-secondary" />
            )}
          </button>
          <AnimatePresence>
            {detailsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2 text-sm text-text-secondary">
                  <p>
                    <span className="font-medium text-text-primary">
                      Category:{" "}
                    </span>
                    {product.category}
                  </p>
                  {product.subcategory && (
                    <p>
                      <span className="font-medium text-text-primary">
                        Type:{" "}
                      </span>
                      {product.subcategory}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-text-primary">
                      Availability:{" "}
                    </span>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                  {product.sizes.length > 0 && (
                    <p>
                      <span className="font-medium text-text-primary">
                        Sizes:{" "}
                      </span>
                      {product.sizes.join(", ")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-text-primary mb-4">
            Reviews ({product.reviews})
          </h4>
          <div className="space-y-3">
            {productReviews.slice(0, 4).map((review) => (
              <ReviewCard
                key={review.id}
                name={review.userName}
                date={new Date(review.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                rating={review.rating}
                text={review.comment}
                avatar={review.userAvatar}
              />
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-text-primary mb-4">
              Related Products
            </h4>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 scrollbar-none">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  className="min-w-[140px] w-[140px] flex-shrink-0"
                >
                  <ProductCard
                    image={rp.image}
                    name={rp.name}
                    price={rp.price}
                    rating={rp.rating}
                    discount={rp.discount}
                    isWishlisted={wishlist?.includes(rp.id)}
                    onToggleWishlist={() => toggleWishlist?.(rp.id)}
                    onClick={() => navigate(`/product/${rp.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-4 flex gap-3 shadow-lg">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => addToCart?.(product, 1)}
        >
          <ShoppingCart size={18} />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => {}}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
