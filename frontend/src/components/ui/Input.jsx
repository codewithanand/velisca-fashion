export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-card rounded-2xl border border-border focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-text-primary placeholder:text-text-secondary transition-colors duration-200 ${Icon ? "pl-11" : ""} ${error ? "border-error" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  );
}
