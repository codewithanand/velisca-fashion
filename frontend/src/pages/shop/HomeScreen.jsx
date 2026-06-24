import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronLeft, ChevronRight, User } from "lucide-react";
import ProductCard from "../../components/ui/ProductCard";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import { useAppContext } from "../../context/AppContext";
import productService from "../../services/productService";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist } = useAppContext();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [resinArtProducts, setResinArtProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bannerRes, trendingRes, newRes, prodRes] = await Promise.all([
          productService.banners.getAll(),
          productService.getTrending(),
          productService.getNewArrivals(),
          productService.getAll({ limit: 50 }),
        ]);
        const bannerList = Array.isArray(bannerRes)
          ? bannerRes
          : bannerRes?.data?.banners || bannerRes?.data || [];
        const trendingList = Array.isArray(trendingRes)
          ? trendingRes
          : trendingRes?.data?.products || trendingRes?.data || [];
        const newList = Array.isArray(newRes)
          ? newRes
          : newRes?.data?.products || newRes?.data || [];
        const allProducts = Array.isArray(prodRes?.data?.products)
          ? prodRes.data.products
          : Array.isArray(prodRes?.data)
          ? prodRes.data
          : [];
        setBanners(bannerList);
        setTrendingProducts(trendingList);
        setNewArrivals(newList);
        setResinArtProducts(allProducts.filter((p) => p.category?.slug === "resin-art" || p.category?.name?.toLowerCase() === "accessories"));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  const apiImg = (product) => product.thumbnail || product.primary_image?.image || `https://placehold.co/400x600/E2E8F0/94A3B8?text=${encodeURIComponent(product.name)}`;
  const apiPrice = (product) => product.display_price ?? product.price ?? 0;
  const apiRating = (product) => product.average_rating ?? 0;
  const apiDiscount = (product) => product.discount_percent ?? (product.has_sale ? Math.round((1 - product.sale_price / product.price) * 100) : 0);

  const prevBanner = () =>
    setCurrentBanner((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  const nextBanner = () =>
    setCurrentBanner((prev) =>
      prev === activeBanners.length - 1 ? 0 : prev + 1
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background"><div className="px-5 py-4 space-y-8 max-w-md mx-auto w-full">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-text-primary">
            Hello, {user?.name || "There"}!
          </h1>
          <p className="caption text-text-secondary">
            Good {getGreeting()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-text-secondary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      {activeBanners.length > 0 && (
      <div className="relative rounded-2xl overflow-hidden h-56">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanners[currentBanner]?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={activeBanners[currentBanner]?.image || activeBanners[currentBanner]?.banner}
              alt={activeBanners[currentBanner]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              {activeBanners[currentBanner]?.discountText && (
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
                  {activeBanners[currentBanner].discountText}
                </span>
              )}
              <h2 className="text-white text-2xl font-bold leading-tight">
                {activeBanners[currentBanner]?.title}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {activeBanners[currentBanner]?.subtitle || activeBanners[currentBanner]?.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={prevBanner}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentBanner
                  ? "bg-white w-5"
                  : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
      <section>
        <SectionTitle title="Trending Now" seeAll onSeeAll={() => {}} />
        <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 scrollbar-none">
          {trendingProducts.map((product) => (
            <div key={product.id} className="min-w-[160px] w-[160px] flex-shrink-0">
              <ProductCard
                image={apiImg(product)}
                name={product.name}
                price={apiPrice(product)}
                rating={apiRating(product)}
                discount={apiDiscount(product)}
                isWishlisted={wishlist?.includes(product.id)}
                onToggleWishlist={() => toggleWishlist?.(product.id)}
                onClick={() => navigate(`/product/${product.slug || product.id}`)}
              />
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Resin Art Collection */}
      {resinArtProducts.length > 0 && (
      <section>
        <SectionTitle title="Resin Art Collection" seeAll onSeeAll={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          {resinArtProducts.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className={index === 1 || index === 2 ? "row-span-2" : ""}
            >
              <ProductCard
                image={apiImg(product)}
                name={product.name}
                price={apiPrice(product)}
                rating={apiRating(product)}
                discount={apiDiscount(product)}
                isWishlisted={wishlist?.includes(product.id)}
                onToggleWishlist={() => toggleWishlist?.(product.id)}
                onClick={() => navigate(`/product/${product.slug || product.id}`)}
              />
            </div>
          ))}
        </div>
      </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
      <section>
        <SectionTitle title="New Arrivals" seeAll onSeeAll={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              image={apiImg(product)}
              name={product.name}
              price={apiPrice(product)}
              rating={apiRating(product)}
              discount={apiDiscount(product)}
              isWishlisted={wishlist?.includes(product.id)}
              onToggleWishlist={() => toggleWishlist?.(product.id)}
              onClick={() => navigate(`/product/${product.slug || product.id}`)}
            />
          ))}
        </div>
      </section>
      )}

      {/* Featured Collection */}
      <section>
        <div className="relative h-64 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1602753324560-5c8c8b57a367?w=800"
            alt="Featured Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
              Featured
            </span>
            <h2 className="text-white text-2xl font-bold">
              Festival Collection
            </h2>
            <p className="text-white/70 text-sm mt-1 mb-4">
              Exclusively designed for the festive season
            </p>
            <Button variant="primary" size="sm" className="w-fit">
              Shop Now
            </Button>
          </div>
        </div>
      </section>
    </div></div>
  );
}
