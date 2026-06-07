import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ quantity, onIncrease, onDecrease, min = 1 }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors disabled:opacity-40"
      >
        <Minus size={16} className="text-text-primary" />
      </button>
      <span className="text-lg font-semibold text-text-primary w-8 text-center">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
      >
        <Plus size={16} className="text-text-primary" />
      </button>
    </div>
  );
}
