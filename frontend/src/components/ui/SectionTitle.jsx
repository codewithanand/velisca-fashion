import { ChevronRight } from "lucide-react";

export default function SectionTitle({ title, seeAll, onSeeAll }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      {seeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          View All <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
