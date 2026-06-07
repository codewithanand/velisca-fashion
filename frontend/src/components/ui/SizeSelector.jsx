import { motion } from "framer-motion";

export default function SizeSelector({ sizes, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((size) => {
        const isSelected = selected === size;
        return (
          <motion.button
            key={size}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(size)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
              isSelected
                ? "bg-primary text-white"
                : "bg-secondary text-text-primary hover:bg-border"
            }`}
          >
            {size}
          </motion.button>
        );
      })}
    </div>
  );
}
