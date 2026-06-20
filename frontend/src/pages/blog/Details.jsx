import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/public/blogs/${slug}`)
      .then((res) => {
        setBlog(res.data?.blog);
        setRelated(res.data?.related || []);
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <h1 className="text-xl font-bold">Post Not Found</h1>
        <button onClick={() => navigate('/blog')} className="text-sm text-primary font-medium">Back to Blog</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      {blog.featured_image && (
        <div className="w-full h-56 sm:h-72 overflow-hidden">
          <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-5 py-8">
        <button onClick={() => navigate('/blog')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </button>

        <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
          {blog.category && (
            <Link to={`/blog?category=${blog.category.slug}`} className="px-2.5 py-1 rounded-full bg-secondary font-medium hover:bg-border transition-colors">
              {blog.category.name}
            </Link>
          )}
          {blog.published_at && (
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">{blog.title}</h1>

        {blog.excerpt && (
          <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">{blog.excerpt}</p>
        )}

        <div
          className="prose prose-sm max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="flex items-center justify-between py-6 border-t border-border">
          <div className="text-xs text-text-secondary">
            {blog.author_id && <span>By {blog.author_id}</span>}
          </div>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors">
            <Share2 size={14} /> Share
          </button>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-text-primary mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="block group">
                  <div className="rounded-xl overflow-hidden bg-secondary aspect-[16/10] mb-2">
                    {r.featured_image ? (
                      <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
