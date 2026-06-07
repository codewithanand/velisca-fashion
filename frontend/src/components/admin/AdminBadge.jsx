const variants = {
  default: 'bg-secondary text-text-secondary',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

export default function AdminBadge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`admin-badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
