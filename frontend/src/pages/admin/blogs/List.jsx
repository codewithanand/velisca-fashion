import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useBlogsStore from '../../../stores/blogs.store';

const statusBadge = { draft: 'warning', published: 'success' };

export default function AdminBlogs() {
  const { blogs, loading, fetchBlogs, deleteBlog } = useBlogsStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [params, setParams] = useState({ page: 1, per_page: 20 });

  useEffect(() => { fetchBlogs(params); }, [fetchBlogs, params]);

  const handleDelete = async () => {
    await deleteBlog(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Blog Posts</h1>
          <p className="text-sm text-text-secondary">{blogs.length} posts</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/blogs/categories">
            <AdminButton variant="outline">Categories</AdminButton>
          </Link>
          <PermissionGuard permission="manage blogs">
            <Link to="/admin/blogs/create">
              <AdminButton><Plus size={16} /> New Post</AdminButton>
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {blogs.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={FileText} title="No blog posts" description="Create your first blog post." actionLabel="New Post" onAction={() => {}} />
        </AdminCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="font-medium text-text-primary">{blog.title}</td>
                  <td className="text-sm text-text-secondary">{blog.category?.name || '-'}</td>
                  <td>
                    <AdminBadge variant={statusBadge[blog.status] || 'default'} className="text-[10px]">{blog.status}</AdminBadge>
                  </td>
                  <td>
                    {blog.is_featured ? <AdminBadge variant="success" className="text-[10px]">Featured</AdminBadge> : '-'}
                  </td>
                  <td className="text-sm text-text-secondary">
                    {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/blogs/edit/${blog.id}`} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Edit3 size={14} className="text-text-secondary" />
                      </Link>
                      <PermissionGuard permission="manage blogs">
                        <button onClick={() => setDeleteConfirm(blog)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
