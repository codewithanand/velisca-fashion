import { Star } from "lucide-react";

export default function ReviewCard({ name, date, rating, text, avatar }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-text-secondary font-semibold text-sm">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-text-primary text-sm">{name}</p>
          <p className="text-xs text-text-secondary">{date}</p>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-star text-star" />
          <span className="text-sm font-medium text-text-primary">{rating}</span>
        </div>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
