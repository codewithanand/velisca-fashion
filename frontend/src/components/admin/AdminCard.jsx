import { motion } from 'framer-motion';

export default function AdminCard({ children, className = '', hover }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`admin-card p-5 ${hover ? 'admin-card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
