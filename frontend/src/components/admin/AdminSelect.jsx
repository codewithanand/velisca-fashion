import { ChevronDown } from 'lucide-react';

export default function AdminSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`admin-select pr-10 ${error ? 'border-danger' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
