import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full">
      <Search
        size={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/80 backdrop-blur-sm rounded-full border border-border/60 py-4 pl-13 pr-5 text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm transition-all duration-300"
      />
    </div>
  );
}
