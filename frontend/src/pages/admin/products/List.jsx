import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Eye, Copy, Star, StarOff, ToggleLeft, ToggleRight, Search, Filter, Package, ChevronDown } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminDataTable from '../../../components/admin/AdminDataTable';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminButton from '../../../components/admin/AdminButton';
import AdminConfirmDialog from '../../../components/admin/AdminConfirmDialog';
import AdminPagination from '../../../components/admin/AdminPagination';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import useProductsStore from '../../../stores/products.store';

const statusVariant = {
  published: 'success',
  draft: 'warning',
  archived: 'danger',
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const { products, loading, pagination, fetchProducts, deleteProduct, duplicateProduct, toggleFeatured, toggleStatus, bulkAction } = useProductsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = useCallback(() => {
    const params = { page, per_page: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (stockFilter) params.stock_status = stockFilter;
    fetchProducts(params);
  }, [page, search, statusFilter, stockFilter, fetchProducts]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => { setSelectedIds([]); }, [products]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteProduct(deleteConfirm.id);
    setDeleteConfirm(null);
    loadProducts();
  };

  const handleDuplicate = async (id) => {
    await duplicateProduct(id);
    loadProducts();
  };

  const handleToggleFeatured = async (id) => {
    await toggleFeatured(id);
    loadProducts();
  };

  const handleToggleStatus = async (id) => {
    await toggleStatus(id);
    loadProducts();
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    await bulkAction(selectedIds, action);
    setSelectedIds([]);
    loadProducts();
  };

  const columns = [
    {
      key: 'thumbnail', label: 'Image', render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
          {row.thumbnail ? (
            <img src={row.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package size={16} className="text-text-secondary" />
          )}
        </div>
      ),
    },
    {
      key: 'name', label: 'Product', render: (row) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary">{row.sku || '—'}</p>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', render: (row) => (
        <span className="text-sm text-text-secondary">{row.category?.name || '—'}</span>
      ),
    },
    {
      key: 'display_price', label: 'Price', render: (row) => (
        <div>
          <span className={`font-medium ${row.has_sale ? 'text-danger' : ''}`}>
            ₹{row.display_price?.toLocaleString()}
          </span>
          {row.has_sale && (
            <span className="text-xs text-text-secondary line-through ml-1">₹{row.price?.toLocaleString()}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock', label: 'Stock', render: (row) => (
        <span className={`font-medium text-sm ${row.is_out_of_stock ? 'text-danger' : row.is_low_stock ? 'text-warning' : 'text-success'}`}>
          {row.stock}
          {row.is_low_stock && !row.is_out_of_stock && <span className="text-xs ml-1">Low</span>}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', render: (row) => (
        <AdminBadge variant={statusVariant[row.status] || 'default'}>{row.status}</AdminBadge>
      ),
    },
    {
      key: 'featured', label: 'Featured', render: (row) => (
        <button onClick={() => handleToggleFeatured(row.id)} className="p-1">
          {row.featured ? <Star size={14} className="text-warning fill-warning" /> : <StarOff size={14} className="text-text-secondary" />}
        </button>
      ),
    },
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="view products">
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="View" onClick={() => navigate(`/admin/products/${row.id}`)}>
              <Eye size={14} className="text-text-secondary" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="edit products">
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit" onClick={() => navigate(`/admin/products/edit/${row.id}`)}>
              <Edit3 size={14} className="text-text-secondary" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Duplicate" onClick={() => handleDuplicate(row.id)}>
              <Copy size={14} className="text-text-secondary" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Toggle Status" onClick={() => handleToggleStatus(row.id)}>
              {row.status === 'published' ? <ToggleRight size={14} className="text-success" /> : <ToggleLeft size={14} className="text-text-secondary" />}
            </button>
          </PermissionGuard>
          <PermissionGuard permission="delete products">
            <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete" onClick={() => setDeleteConfirm(row)}>
              <Trash2 size={14} className="text-danger" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary">{pagination.total} products total</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <span className="text-text-secondary">{selectedIds.length} selected</span>
              <button onClick={() => handleBulkAction('delete')} className="text-danger hover:underline text-xs">Delete</button>
              <button onClick={() => handleBulkAction('publish')} className="text-success hover:underline text-xs">Publish</button>
              <button onClick={() => handleBulkAction('unpublish')} className="text-warning hover:underline text-xs">Unpublish</button>
              <button onClick={() => handleBulkAction('feature')} className="text-primary hover:underline text-xs">Feature</button>
              <button onClick={() => setSelectedIds([])} className="text-text-secondary hover:underline text-xs">Clear</button>
            </div>
          )}
          <PermissionGuard permission="create products">
            <AdminButton onClick={() => navigate('/admin/products/add')}>
              <Plus size={16} /> Add Product
            </AdminButton>
          </PermissionGuard>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products by name or SKU..."
            className="admin-input pl-9 w-full"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${showFilters ? 'border-primary text-primary bg-primary/5' : 'border-border text-text-secondary hover:bg-secondary'}`}>
          <Filter size={14} /> Filters <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 p-4 rounded-xl bg-secondary/50">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="admin-input text-sm w-auto">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="admin-input text-sm w-auto">
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          {(statusFilter || stockFilter) && (
            <button onClick={() => { setStatusFilter(''); setStockFilter(''); setPage(1); }} className="text-xs text-primary hover:underline">Clear filters</button>
          )}
        </motion.div>
      )}

      <AdminCard>
        <AdminDataTable
          columns={columns}
          data={products}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your search or filters."
          emptyActionLabel="Add Product"
          onEmptyAction={() => navigate('/admin/products/add')}
        />
        {pagination.last_page > 1 && (
          <div className="px-4 pb-4">
            <AdminPagination page={pagination.page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />
          </div>
        )}
      </AdminCard>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
