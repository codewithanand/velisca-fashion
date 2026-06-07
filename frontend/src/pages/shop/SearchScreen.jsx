import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, TrendingUp, Clock } from "lucide-react";
import SearchBar from "../components/ui/SearchBar";
import ProductCard from "../components/ui/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import { useAppContext } from "../context/AppContext";
import { products } from "../data/products";

const trendingSearches = [
  "Floral Kurtis",
  "Party Wear",
  "Cotton Tops",
  "Embroidered",
  "Summer Collection",
];

const filterChips = ["All", "Kurtis", "Dresses", "Tops", "Bottoms", "Accessories"];

const categoryMap = {
  All: null,
  Kurtis: "kurtis",
  Dresses: "dresses",
  Tops: "tops",
  Bottoms: "bottoms",
  Accessories: "accessories",
};

export default function SearchScreen() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Floral Kurti",
    "Anarkali",
  ]);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      !categoryMap[activeFilter] ||
      p.category === categoryMap[activeFilter];
    return matchesSearch && matchesFilter;
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const removeRecent = (term) => {
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  };

  const handleSelectRecent = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search for products, brands & more"
      />

      {/* Recent Searches */}
      {!searchTerm && recentSearches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Recent Searches
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <span
                key={term}
                onClick={() => handleSelectRecent(term)}
                className="inline-flex items-center gap-1.5 bg-secondary text-text-primary text-sm px-3.5 py-2 rounded-full cursor-pointer hover:bg-border transition-colors"
              >
                {term}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecent(term);
                  }}
                >
                  <X size={14} className="text-text-secondary" />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Trending Searches */}
      {!searchTerm && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Trending Searches
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <span
                key={term}
                onClick={() => setSearchTerm(term)}
                className="inline-flex items-center gap-1.5 bg-secondary text-text-primary text-sm px-3.5 py-2 rounded-full cursor-pointer hover:bg-border transition-colors"
              >
                <TrendingUp size={14} className="text-red-400" />
                {term}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeFilter === chip
                ? "bg-primary text-white"
                : "bg-secondary text-text-secondary hover:text-text-primary"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product, index) => (
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
                isWishlisted={wishlist?.includes(product.id)}
                onToggleWishlist={() => toggleWishlist?.(product.id)}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No results found"
          description="Try adjusting your search or filter to find what you're looking for."
        />
      )}
    </div>
  );
}
