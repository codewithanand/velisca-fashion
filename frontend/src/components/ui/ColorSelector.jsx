import { motion } from "framer-motion";

export default function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="flex gap-3">
      {colors.map((color) => {
        const isSelected = selected === color;
        return (
          <motion.button
            key={color}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(color)}
            className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
              isSelected ? "border-primary scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        );
      })}
    </div>
  );
}
