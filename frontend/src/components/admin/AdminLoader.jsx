import { LoaderCircle } from 'lucide-react';

export default function AdminLoader({ fullScreen, className = '' }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LoaderCircle size={28} className="text-primary animate-spin" />
      <p className="text-sm text-text-secondary">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
