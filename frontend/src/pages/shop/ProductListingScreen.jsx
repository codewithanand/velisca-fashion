import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown, Star } from "lucide-react";
import ProductCard from "../../components/ui/ProductCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useAppContext } from "../../context/AppContext";
import productService from "../../services/productService";
import Loader from "../../components/ui/Loader";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "newest" },
];

const PLACEHOLDER = 'https://placehold.co/400x600/E2E8F0/94A3B8?text=Product';
const apiImg = (p) => p?.thumbnail || p?.primary_image?.image || PLACEHOLDER;
const apiPrice = (p) => p?.display_price ?? p?.price ?? 0;
const apiRating = (p) => p?.average_rating ?? 0;
const apiDiscount = (p) => p?.discount_percent ?? (p?.has_sale ? Math.round((1 - p.sale_price / p.price) * 100) : 0);

export default function ProductListingScreen() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useAppContext();

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productService.getAll({ limit: 100 }).then((res) => {
      const list = Array.isArray(res?.data?.products) ? res.data.products : Array.isArray(res?.data) ? res.data : [];
      setAllProducts(list);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "All Products";

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (category) {
      result = result.filter(
        (p) => (p.category?.slug || p.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category?.slug || p.category)
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        const pSizes = (p.variants || []).filter(v => v.size).map(v => v.size?.name || v.size);
        return pSizes.some((s) => selectedSizes.includes(s));
      });
    }

    result = result.filter(
      (p) => apiPrice(p) >= priceRange[0] && apiPrice(p) <= priceRange[1]
    );

    if (minRating > 0) {
      result = result.filter((p) => apiRating(p) >= minRating);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => apiPrice(a) - apiPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => apiPrice(b) - apiPrice(a));
        break;
      case "rating":
        result.sort((a, b) => apiRating(b) - apiRating(a));
        break;
      case "newest":
        result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, category, selectedSizes, priceRange, minRating, selectedCategories, sortBy]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSelectedCategories([]);
  };

  const uniqueCategories = [...new Set(allProducts.map((p) => p.category?.slug || p.category || '').filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background"><div className="px-5 py-4 max-w-md mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-text-primary">{categoryName}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-text-secondary text-sm font-medium hover:text-text-primary hover:shadow-md transition-all duration-300"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>
          <button
            onClick={() => setSortOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-text-secondary text-sm font-medium hover:text-text-primary hover:shadow-md transition-all duration-300"
          >
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-text-secondary">No products found</p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
      >
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Price Range
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Min"
              />
              <span className="text-text-secondary">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-text-primary border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Size
            </h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedSizes.includes(size)
                      ? "bg-primary text-white"
                      : "bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Minimum Rating
            </h4>
            <div className="flex gap-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    minRating === rating
                      ? "bg-primary text-white"
                      : "bg-secondary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Star
                    size={14}
                    className={
                      minRating === rating ? "fill-white" : "fill-star text-star"
                    }
                  />
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Category
            </h4>
            {uniqueCategories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary capitalize">
                  {cat}
                </span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                resetFilters();
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setFilterOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort By"
      >
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setSortOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                sortBy === option.value
                  ? "bg-primary/10 text-primary"
                  : "text-text-primary hover:bg-secondary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Modal>
    </div></div>
  );
}
