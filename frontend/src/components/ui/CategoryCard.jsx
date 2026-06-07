import { motion } from "framer-motion";

export default function CategoryCard({ image, name, onClick }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
    >
      <img src={image} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h3 className="absolute bottom-4 left-4 text-white text-lg font-semibold">
        {name}
      </h3>
    </motion.div>
  );
}
