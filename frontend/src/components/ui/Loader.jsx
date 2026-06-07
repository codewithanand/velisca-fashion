import { LoaderCircle } from "lucide-react";

export default function Loader({ fullScreen, className = "" }) {
  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderCircle size={32} className="text-primary animate-spin" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
