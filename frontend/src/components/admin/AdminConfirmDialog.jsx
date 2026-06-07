import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import AdminButton from './AdminButton';

export default function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-danger" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X size={16} className="text-text-secondary" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-6">{message}</p>
              <div className="flex gap-3 justify-end">
                <AdminButton variant="ghost" size="sm" onClick={onClose}>
                  {cancelLabel}
                </AdminButton>
                <AdminButton variant={variant} size="sm" onClick={onConfirm}>
                  {confirmLabel}
                </AdminButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
