import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../../components/ui/CategoryCard";
import productService from "../../services/productService";
import Loader from "../../components/ui/Loader";

export default function CategoriesScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.categories.getAll().then((res) => {
      const list = Array.isArray(res) ? res : res?.data?.categories || res?.data || [];
      setCategories(list);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background"><div className="px-5 py-4 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-bold text-text-primary mb-5">Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CategoryCard
              image={category.image || category.banner}
              name={category.name}
              onClick={() =>
                navigate(`/products/${category.slug || category.name.toLowerCase()}`)
              }
            />
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
