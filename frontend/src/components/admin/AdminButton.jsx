export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  onClick,
  className = '',
  disabled,
  type = 'button',
}) {
  const variants = {
    primary: 'admin-btn-primary',
    secondary: 'admin-btn-secondary',
    ghost: 'admin-btn-ghost',
    danger: 'admin-btn-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
