const variantStyles = {
  discount: "bg-red-50 text-red-500",
  new: "bg-green-50 text-green-600",
  default: "bg-secondary text-text-secondary",
};

export default function Badge({ children, variant = "default" }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
