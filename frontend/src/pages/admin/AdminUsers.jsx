import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Ban, CheckCircle } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';

const initialUsers = [
  { id: 1, name: 'Sophia Chen', email: 'sophia@example.com', orders: 12, totalSpent: 2450.00, status: 'active', joined: '2023-06-15' },
  { id: 2, name: 'Emma Wilson', email: 'emma@example.com', orders: 8, totalSpent: 1280.00, status: 'active', joined: '2023-08-22' },
  { id: 3, name: 'Olivia Johnson', email: 'olivia@example.com', orders: 3, totalSpent: 420.00, status: 'blocked', joined: '2023-11-01' },
  { id: 4, name: 'Isabella Brown', email: 'isabella@example.com', orders: 15, totalSpent: 3200.00, status: 'active', joined: '2023-04-10' },
  { id: 5, name: 'Mia Davis', email: 'mia@example.com', orders: 6, totalSpent: 890.00, status: 'active', joined: '2023-09-05' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [blockConfirm, setBlockConfirm] = useState(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = () => {
    setUsers(users.map((u) =>
      u.id === blockConfirm.id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
    ));
    setBlockConfirm(null);
  };

  const columns = [
    { key: 'name', label: 'User', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs font-semibold text-text-secondary">{row.name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'orders', label: 'Orders' },
    { key: 'totalSpent', label: 'Total Spent', render: (row) => <span className="font-medium">${row.totalSpent.toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (row) => (
      <AdminBadge variant={row.status === 'active' ? 'success' : 'danger'}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </AdminBadge>
    )},
    { key: 'joined', label: 'Joined' },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="View Orders">
          <ShoppingCart size={14} className="text-text-secondary" />
        </button>
        <button
          onClick={() => setBlockConfirm(row)}
          className={`p-1.5 rounded-lg transition-colors ${row.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
          title={row.status === 'active' ? 'Block User' : 'Unblock User'}
        >
          {row.status === 'active' ? (
            <Ban size={14} className="text-danger" />
          ) : (
            <CheckCircle size={14} className="text-green-600" />
          )}
        </button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Users</h1>
        <p className="text-sm text-text-secondary">{users.length} registered users</p>
      </div>

      <AdminCard>
        <AdminDataTable
          columns={columns}
          data={filtered}
          searchable
          searchValue={search}
          onSearch={setSearch}
          searchPlaceholder="Search users by name or email..."
          emptyTitle="No users found"
          emptyDescription="No users match your search."
        />
      </AdminCard>

      <AdminConfirmDialog
        isOpen={!!blockConfirm}
        onClose={() => setBlockConfirm(null)}
        onConfirm={toggleBlock}
        title={blockConfirm?.status === 'active' ? 'Block User' : 'Unblock User'}
        message={blockConfirm?.status === 'active'
          ? `Are you sure you want to block ${blockConfirm?.name}? They will not be able to access their account.`
          : `Are you sure you want to unblock ${blockConfirm?.name}?`}
        confirmLabel={blockConfirm?.status === 'active' ? 'Block' : 'Unblock'}
        variant={blockConfirm?.status === 'active' ? 'danger' : 'primary'}
      />
    </motion.div>
  );
}
