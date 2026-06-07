import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';

const stats = [
  { label: 'Total Revenue', value: '$48,250', change: '+12.5%', up: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Total Orders', value: '1,842', change: '+8.2%', up: true, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Total Users', value: '24,561', change: '+18.7%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Growth Rate', value: '23.5%', change: '-2.4%', up: false, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const monthlyData = [
  { name: 'Jan', revenue: 32000, orders: 140, users: 1200 },
  { name: 'Feb', revenue: 28000, orders: 120, users: 1100 },
  { name: 'Mar', revenue: 35000, orders: 160, users: 1350 },
  { name: 'Apr', revenue: 30000, orders: 145, users: 1280 },
  { name: 'May', revenue: 42000, orders: 180, users: 1500 },
  { name: 'Jun', revenue: 38000, orders: 165, users: 1420 },
  { name: 'Jul', revenue: 45000, orders: 190, users: 1600 },
  { name: 'Aug', revenue: 48250, orders: 200, users: 1750 },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'Sophia Chen', amount: '$245.00', status: 'delivered', date: '2 min ago' },
  { id: '#ORD-002', customer: 'Emma Wilson', amount: '$189.00', status: 'processing', date: '15 min ago' },
  { id: '#ORD-003', customer: 'Olivia Johnson', amount: '$420.00', status: 'pending', date: '1 hr ago' },
  { id: '#ORD-004', customer: 'Isabella Brown', amount: '$75.00', status: 'delivered', date: '2 hr ago' },
  { id: '#ORD-005', customer: 'Mia Davis', amount: '$310.00', status: 'shipped', date: '3 hr ago' },
];

const lowStockItems = [
  { name: 'Resin Art Vase', sku: 'RS-001', stock: 3, threshold: 10 },
  { name: 'Silk Scarf', sku: 'SF-024', stock: 5, threshold: 15 },
  { name: 'Boho Earrings', sku: 'BE-112', stock: 2, threshold: 20 },
];

const topProducts = [
  { name: 'Crystal Resin Vase', sales: 234, revenue: '$11,700' },
  { name: 'Silk Maxi Dress', sales: 189, revenue: '$18,900' },
  { name: 'Handmade Ceramic Mug', sales: 156, revenue: '$4,680' },
  { name: 'Leather Tote Bag', sales: 142, revenue: '$14,200' },
];

const statusVariant = {
  delivered: 'success',
  processing: 'info',
  pending: 'warning',
  shipped: 'primary',
};

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('monthly');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary">Welcome back, Admin. Here's what's happening.</p>
      </div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <AdminCard key={stat.label}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </AdminCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <AdminCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Revenue Overview</h3>
              <div className="flex gap-1">
                {['weekly', 'monthly', 'yearly'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      timeframe === t ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B6F5A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B6F5A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4C0B8" strokeOpacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5C4A45' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5C4A45' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #D4C0B8', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B6F5A" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item}>
          <AdminCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Orders & Users</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4C0B8" strokeOpacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5C4A45' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5C4A45' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #D4C0B8', background: '#fff' }}
                  />
                  <Bar dataKey="orders" fill="#C4957A" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="users" fill="#8B6F5A" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <ShoppingCart size={14} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{order.customer}</p>
                      <p className="text-xs text-text-secondary">{order.id} • {order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{order.amount}</p>
                    <AdminBadge variant={statusVariant[order.status]} className="text-[10px]">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </AdminBadge>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <AdminCard>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              <h3 className="text-sm font-semibold text-text-primary">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.sku} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${item.stock <= 3 ? 'text-danger' : 'text-warning'}`}>
                      {item.stock} left
                    </p>
                    <p className="text-xs text-text-secondary">min: {item.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Top Selling</h3>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-secondary w-4">{i + 1}</span>
                    <p className="text-sm text-text-primary">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{product.revenue}</p>
                    <p className="text-xs text-text-secondary">{product.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
