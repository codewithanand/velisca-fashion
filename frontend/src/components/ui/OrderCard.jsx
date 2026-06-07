import { motion } from "framer-motion";
import Badge from "./Badge";

const statusVariant = {
  pending: "default",
  shipped: "new",
  delivered: "discount",
};

export default function OrderCard({ image, name, price, status, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-4 border border-border flex gap-4"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-text-primary text-sm truncate">{name}</h4>
          <span className="text-sm font-semibold text-text-primary shrink-0 ml-2">₹{price.toLocaleString('en-IN')}</span>
        </div>
        <Badge variant={statusVariant[status] || "default"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {typeof progress === "number" && (
          <div className="mt-3">
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">{progress}% delivered</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
