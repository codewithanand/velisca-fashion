import { useState, useMemo, useEffect } from "react";
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
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import SizeSelector from "../../components/ui/SizeSelector";
import ColorSelector from "../../components/ui/ColorSelector";
import ReviewCard from "../../components/ui/ReviewCard";
import ProductCard from "../../components/ui/ProductCard";
import { useAppContext } from "../../context/AppContext";
import productService from "../../services/productService";

const PLACEHOLDER = 'https://placehold.co/400x600/E2E8F0/94A3B8?text=Product';

export default function ProductDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useAppContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await productService.getById(id);
        const p = res?.data?.product || res?.data || res;
        setProduct(p);
        if (p.category) {
          try {
            const catRes = await productService.getByCategory(p.category.slug || p.category.id);
            const related = Array.isArray(catRes) ? catRes : catRes?.data?.products || catRes?.data || [];
            setRelatedProducts(related.filter((r) => r.id !== p.id).slice(0, 8));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const productReviews = useMemo(
    () => product?.reviews || [],
    [product]
  );

  const apiImg = (p) => p?.thumbnail || p?.primary_image?.image || PLACEHOLDER;
  const apiPrice = (p) => p?.display_price ?? p?.price ?? 0;
  const apiRating = (p) => p?.average_rating ?? 0;
  const apiDiscount = (p) => p?.discount_percent ?? (p?.has_sale ? Math.round((1 - p.sale_price / p.price) * 100) : 0);
  const productImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images || [];
    if (imgs.length > 0) return imgs.map((i) => i.image || i);
    const primary = product.primary_image?.image;
    if (primary) return [primary];
    return [product.thumbnail].filter(Boolean);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
  const sizes = product.variants?.filter(v => v.size).map(v => v.size?.name || v.size).filter((v, i, a) => a.indexOf(v) === i) || [];
  const colors = product.variants?.filter(v => v.color).map(v => v.color?.hex_code || v.color?.name || v.color).filter((v, i, a) => a.indexOf(v) === i) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pb-24">
      {/* Image Carousel */}
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={productImages[currentImage] || apiImg(product)}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          {apiDiscount(product) > 0 && (
            <Badge variant="discount" className="absolute top-4 left-4">
              -{apiDiscount(product)}%
            </Badge>
          )}
          {product.is_new && (
            <Badge variant="new" className="absolute top-4 left-4">
              New
            </Badge>
          )}
          {/* Dot indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {productImages.map((_, i) => (
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
              ₹{apiPrice(product)}
            </span>
            {product.has_sale && product.price && (
              <span className="text-lg text-text-secondary line-through">
                ₹{product.price}
              </span>
            )}
            {apiDiscount(product) > 0 && (
              <Badge variant="discount">{apiDiscount(product)}% off</Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        {apiRating(product) > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-star text-star" />
            <span className="font-semibold text-text-primary">
              {apiRating(product)}
            </span>
          </div>
          <span className="text-text-secondary text-sm">
            ({product.reviews_count || product.reviews?.length || 0} reviews)
          </span>
        </div>
        )}

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {product.description}
        </p>

        {/* Size Selector */}
        {sizes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Select Size
            </h4>
            <SizeSelector
              sizes={sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>
        )}

        {/* Color Selector */}
        {colors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Select Color
            </h4>
            <ColorSelector
              colors={colors}
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
                    {product.category?.name || product.category}
                  </p>
                  {product.category?.slug && (
                    <p>
                      <span className="font-medium text-text-primary">
                        Type:{" "}
                      </span>
                      {product.category.slug}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-text-primary">
                      Availability:{" "}
                    </span>
                    {product.is_out_of_stock ? "Out of Stock" : "In Stock"}
                  </p>
                  {sizes.length > 0 && (
                    <p>
                      <span className="font-medium text-text-primary">
                        Sizes:{" "}
                      </span>
                      {sizes.join(", ")}
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
            Reviews ({product.reviews_count || product.reviews?.length || 0})
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
              {relatedProducts.map((rp) => {
                const rpImg = rp.thumbnail || rp.primary_image?.image || PLACEHOLDER;
                const rpPrice = rp.display_price ?? rp.price ?? 0;
                const rpRating = rp.average_rating ?? 0;
                const rpDiscount = rp.discount_percent ?? (rp.has_sale ? Math.round((1 - rp.sale_price / rp.price) * 100) : 0);
                return (
                <div
                  key={rp.id}
                  className="min-w-[140px] w-[140px] flex-shrink-0"
                >
                  <ProductCard
                    image={rpImg}
                    name={rp.name}
                    price={rpPrice}
                    rating={rpRating}
                    discount={rpDiscount}
                    isWishlisted={wishlist?.includes(rp.id)}
                    onToggleWishlist={() => toggleWishlist?.(rp.id)}
                    onClick={() => navigate(`/product/${rp.slug || rp.id}`)}
                  />
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/60 px-5 py-4 flex gap-3 shadow-2xl rounded-t-2xl">
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
