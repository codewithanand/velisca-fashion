import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-primary hover:bg-primary-dark text-white",
  secondary:
    "bg-secondary text-text-primary hover:bg-border",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost:
    "text-text-secondary hover:bg-secondary hover:text-text-primary",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  onClick,
  className = "",
  disabled,
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-2xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}
