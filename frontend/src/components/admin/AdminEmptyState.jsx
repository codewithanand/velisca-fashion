import { Inbox } from 'lucide-react';
import AdminButton from './AdminButton';

export default function AdminEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-secondary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && (
        <AdminButton variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}
