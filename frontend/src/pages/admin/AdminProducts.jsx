import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminButton from '../../components/admin/AdminButton';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';

const initialProducts = [
  { id: 1, name: 'Crystal Resin Vase', sku: 'RS-001', category: 'Resin Art', price: 49.99, stock: 23, status: 'active', image: '' },
  { id: 2, name: 'Silk Maxi Dress', sku: 'DR-024', category: 'Fashion', price: 189.99, stock: 12, status: 'active', image: '' },
  { id: 3, name: 'Boho Tassel Earrings', sku: 'BE-112', category: 'Accessories', price: 34.99, stock: 45, status: 'active', image: '' },
  { id: 4, name: 'Handmade Ceramic Mug', sku: 'CM-008', category: 'Resin Art', price: 29.99, stock: 0, status: 'inactive', image: '' },
  { id: 5, name: 'Leather Tote Bag', sku: 'TB-045', category: 'Accessories', price: 149.99, stock: 8, status: 'active', image: '' },
  { id: 6, name: 'Wool Blend Scarf', sku: 'SC-031', category: 'Fashion', price: 59.99, stock: 18, status: 'active', image: '' },
  { id: 7, name: 'Resin Coaster Set', sku: 'CS-004', category: 'Resin Art', price: 24.99, stock: 0, status: 'inactive', image: '' },
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const columns = [
    { key: 'image', label: 'Image', render: (row) => (
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
        <span className="text-xs font-semibold text-text-secondary">{row.name.charAt(0)}</span>
      </div>
    )},
    { key: 'name', label: 'Product', render: (row) => (
      <div>
        <p className="text-sm font-medium text-text-primary">{row.name}</p>
        <p className="text-xs text-text-secondary">{row.sku}</p>
      </div>
    )},
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (row) => (
      <span className="font-medium">${row.price.toFixed(2)}</span>
    )},
    { key: 'stock', label: 'Stock', render: (row) => (
      <span className={`font-medium ${row.stock === 0 ? 'text-danger' : row.stock <= 10 ? 'text-warning' : ''}`}>
        {row.stock}
      </span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <AdminBadge variant={row.status === 'active' ? 'success' : 'danger'}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </AdminBadge>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="View">
          <Eye size={15} className="text-text-secondary" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit" onClick={() => navigate(`/admin/products/edit/${row.id}`)}>
          <Edit3 size={15} className="text-text-secondary" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete" onClick={() => setDeleteConfirm(row)}>
          <Trash2 size={15} className="text-danger" />
        </button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary">{products.length} products total</p>
        </div>
        <AdminButton onClick={() => navigate('/admin/products/add')}>
          <Plus size={16} />
          Add Product
        </AdminButton>
      </div>

      <AdminCard>
        <AdminDataTable
          columns={columns}
          data={filtered}
          searchable
          searchValue={search}
          onSearch={setSearch}
          searchPlaceholder="Search products by name or SKU..."
          emptyTitle="No products found"
          emptyDescription="Try adjusting your search or add a new product."
          emptyActionLabel="Add Product"
          onEmptyAction={() => navigate('/admin/products/add')}
        />
      </AdminCard>

      <AdminConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
