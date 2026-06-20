import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import api from '../../services/api';

export default function CmsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/public/cms/pages/${slug}`)
      .then((res) => setPage(res.data?.page))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <FileText size={48} className="text-text-secondary" />
        <h1 className="text-xl font-bold text-text-primary">Page Not Found</h1>
        <p className="text-sm text-text-secondary">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/home')} className="text-sm text-primary font-medium">Go Home</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {page.banner && (
        <div className="w-full h-48 sm:h-64 overflow-hidden">
          <img src={page.banner} alt={page.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-5 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{page.title}</h1>
        {page.excerpt && (
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">{page.excerpt}</p>
        )}
        <div
          className="prose prose-sm max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </motion.div>
  );
}
