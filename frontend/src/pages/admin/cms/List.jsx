import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminModal from '../../../components/admin/AdminModal';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminPagination from '../../../components/admin/AdminPagination';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useCmsPagesStore from '../../../stores/cmsPages.store';

const statusBadge = {
  draft: 'warning',
  published: 'success',
  scheduled: 'info',
};

const pageTypeLabels = {
  static: 'Static Page',
  landing: 'Landing Page',
  marketing: 'Marketing Page',
  seo: 'SEO Page',
  policy: 'Policy Page',
};

export default function AdminCmsPages() {
  const { pages, loading, fetchPages, deletePage } = useCmsPagesStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [params, setParams] = useState({ page: 1, per_page: 20 });

  useEffect(() => { fetchPages(params); }, [fetchPages, params]);

  const handleDelete = async () => {
    await deletePage(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">CMS Pages</h1>
          <p className="text-sm text-text-secondary">{pages.length} pages</p>
        </div>
        <PermissionGuard permission="manage cms">
          <Link to="/admin/cms-pages/create">
            <AdminButton><Plus size={16} /> Create Page</AdminButton>
          </Link>
        </PermissionGuard>
      </div>

      {pages.length === 0 && !loading ? (
        <AdminCard>
          <AdminEmptyState icon={FileText} title="No CMS pages" description="Create your first CMS page." actionLabel="Create Page" onAction={() => {}} />
        </AdminCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Page Type</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="font-medium text-text-primary">{page.title}</td>
                  <td className="text-text-secondary text-sm">/{page.slug}</td>
                  <td>
                    <AdminBadge variant="default" className="text-[10px]">
                      {pageTypeLabels[page.page_type] || page.page_type}
                    </AdminBadge>
                  </td>
                  <td>
                    <AdminBadge variant={statusBadge[page.status] || 'default'} className="text-[10px]">
                      {page.status}
                    </AdminBadge>
                  </td>
                  <td className="text-sm text-text-secondary">
                    {page.published_at ? new Date(page.published_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/cms-pages/edit/${page.id}`} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Edit3 size={14} className="text-text-secondary" />
                      </Link>
                      <PermissionGuard permission="manage cms">
                        <button onClick={() => setDeleteConfirm(page)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
        title="Delete CMS Page"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
