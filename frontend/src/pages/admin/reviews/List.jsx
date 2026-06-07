import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, MessageSquare, Star } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminButton from '../../../components/admin/AdminButton';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminPagination from '../../../components/admin/AdminPagination';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useReviewsStore from '../../../stores/reviews.store';

export default function AdminReviews() {
  const { reviews, loading, pagination, fetchReviews, approveReview, rejectReview, deleteReview } = useReviewsStore();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchReviews({ status: filter || undefined, page });
  }, [filter, page, fetchReviews]);

  const handleApprove = async (id) => {
    await approveReview(id);
    fetchReviews({ status: filter || undefined, page });
  };

  const handleReject = async (id) => {
    await rejectReview(id);
    fetchReviews({ status: filter || undefined, page });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteReview(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchReviews({ status: filter || undefined, page });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Reviews</h1>
          <p className="text-sm text-text-secondary">{pagination.total} reviews</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <AdminCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={40} className="text-text-secondary mb-3" />
            <p className="text-text-primary font-medium">No reviews found</p>
            <p className="text-sm text-text-secondary mt-1">
              {filter ? `No ${filter} reviews` : 'No reviews yet'}
            </p>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div key={review.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-text-primary shrink-0">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{review.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? 'text-warning fill-warning' : 'text-border'} />
                        ))}
                      </div>
                      <AdminBadge variant={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'danger' : 'warning'}>
                        {review.status}
                      </AdminBadge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      on Product #{review.product_id} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    {review.review && (
                      <p className="text-sm text-text-primary mt-2">{review.review}</p>
                    )}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                            <img src={img.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <PermissionGuard permission="approve reviews">
                    {review.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(review.id)} className="p-2 rounded-lg hover:bg-green-50 text-success transition-colors" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleReject(review.id)} className="p-2 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Reject">
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </PermissionGuard>
                  <PermissionGuard permission="delete reviews">
                    <button onClick={() => setDeleteConfirm(review)} className="p-2 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </motion.div>
          ))}

          {pagination.last_page > 1 && (
            <div className="flex justify-center pt-2">
              <AdminPagination page={pagination.page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
