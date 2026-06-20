import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function BlogList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = api.get('/public/blogs', { params: categorySlug ? { category: categorySlug } : {} });
    const fetchCategories = api.get('/public/blogs/categories');

    Promise.all([fetchBlogs, fetchCategories])
      .then(([blogsRes, catsRes]) => {
        const data = blogsRes.data;
        setBlogs(data?.data || data?.blogs || []);
        setCategories(catsRes.data?.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Our Journal</h1>
        <p className="text-sm text-text-secondary mb-8">Stories, style guides, and inspiration from Velisca.</p>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link to="/blog"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !categorySlug ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'
              }`}>
              All
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/blog?category=${cat.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categorySlug === cat.slug ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'
                }`}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/blog/${blog.slug}`} className="block group">
                  <div className="rounded-2xl overflow-hidden bg-secondary aspect-[4/3] mb-3">
                    {blog.featured_image ? (
                      <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-secondary mb-1.5">
                    {blog.category && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary font-medium">{blog.category.name}</span>
                    )}
                    {blog.published_at && (
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(blog.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                  {blog.excerpt && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{blog.excerpt}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
