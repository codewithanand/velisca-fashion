import { ChevronRight } from "lucide-react";

export default function ProfileMenuItem({ icon: Icon, label, onClick, disabled, right }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Icon size={20} className="text-text-primary" />
        </div>
      )}
      <span className="flex-1 text-left text-text-primary font-medium">{label}</span>
      {right || <ChevronRight size={18} className="text-text-secondary" />}
    </button>
  );
}
