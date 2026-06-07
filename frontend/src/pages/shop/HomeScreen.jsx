import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronLeft, ChevronRight, User } from "lucide-react";
import ProductCard from "../../components/ui/ProductCard";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import { useAppContext } from "../../context/AppContext";
import { products } from "../../data/products";
import { banners } from "../../data/banners";

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

  useEffect(() => {
    const active = banners.filter((b) => b.isActive);
    if (active.length < 2) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % active.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeBanners = banners.filter((b) => b.isActive);
  const trendingProducts = products.filter((p) => p.isTrending);
  const resinArtProducts = products.filter((p) => p.category === "accessories");
  const newArrivals = products.filter((p) => p.isNew);

  const prevBanner = () =>
    setCurrentBanner((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  const nextBanner = () =>
    setCurrentBanner((prev) =>
      prev === activeBanners.length - 1 ? 0 : prev + 1
    );

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
              src={activeBanners[currentBanner]?.image}
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
                {activeBanners[currentBanner]?.subtitle}
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

      {/* Trending Kurtis */}
      <section>
        <SectionTitle title="Trending Kurtis" seeAll onSeeAll={() => {}} />
        <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 scrollbar-none">
          {trendingProducts.map((product) => (
            <div key={product.id} className="min-w-[160px] w-[160px] flex-shrink-0">
              <ProductCard
                image={product.image}
                name={product.name}
                price={product.price}
                rating={product.rating}
                discount={product.discount}
                isWishlisted={wishlist?.includes(product.id)}
                onToggleWishlist={() => toggleWishlist?.(product.id)}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Resin Art Collection */}
      <section>
        <SectionTitle title="Resin Art Collection" seeAll onSeeAll={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          {resinArtProducts.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className={index === 1 || index === 2 ? "row-span-2" : ""}
            >
              <ProductCard
                image={product.image}
                name={product.name}
                price={product.price}
                rating={product.rating}
                discount={product.discount}
                isWishlisted={wishlist?.includes(product.id)}
                onToggleWishlist={() => toggleWishlist?.(product.id)}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <SectionTitle title="New Arrivals" seeAll onSeeAll={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              discount={product.discount}
              isWishlisted={wishlist?.includes(product.id)}
              onToggleWishlist={() => toggleWishlist?.(product.id)}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </section>

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
