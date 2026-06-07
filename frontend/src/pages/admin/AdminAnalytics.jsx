import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import AdminCard from '../../components/admin/AdminCard';

const revenueData = [
  { name: 'Jan', revenue: 32000, orders: 140 },
  { name: 'Feb', revenue: 28000, orders: 120 },
  { name: 'Mar', revenue: 35000, orders: 160 },
  { name: 'Apr', revenue: 30000, orders: 145 },
  { name: 'May', revenue: 42000, orders: 180 },
  { name: 'Jun', revenue: 38000, orders: 165 },
  { name: 'Jul', revenue: 45000, orders: 190 },
  { name: 'Aug', revenue: 48250, orders: 200 },
];

const userGrowthData = [
  { name: 'Jan', users: 1200, active: 800 },
  { name: 'Feb', users: 1100, active: 750 },
  { name: 'Mar', users: 1350, active: 900 },
  { name: 'Apr', users: 1280, active: 850 },
  { name: 'May', users: 1500, active: 1100 },
  { name: 'Jun', users: 1420, active: 980 },
  { name: 'Jul', users: 1600, active: 1200 },
  { name: 'Aug', users: 1750, active: 1350 },
];

const conversionData = [
  { name: 'Week 1', rate: 2.4 },
  { name: 'Week 2', rate: 3.1 },
  { name: 'Week 3', rate: 2.8 },
  { name: 'Week 4', rate: 3.5 },
  { name: 'Week 5', rate: 3.2 },
  { name: 'Week 6', rate: 3.8 },
  { name: 'Week 7', rate: 4.1 },
  { name: 'Week 8', rate: 3.9 },
];

const categoryData = [
  { name: 'Fashion', value: 45 },
  { name: 'Resin Art', value: 30 },
  { name: 'Accessories', value: 25 },
];

const COLORS = ['#B08968', '#D8B4A0', '#EADCD6'];

const stats = [
  { label: 'Conversion Rate', value: '3.9%', change: '+0.8%', up: true, icon: TrendingUp },
  { label: 'Avg Order Value', value: '$124.50', change: '+5.2%', up: true, icon: DollarSign },
  { label: 'Customer Lifetime', value: '$890', change: '+12.3%', up: true, icon: Users },
  { label: 'Return Rate', value: '2.1%', change: '-0.3%', up: true, icon: ShoppingCart },
];

export default function AdminAnalytics() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary">Track your business performance</p>
      </div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <AdminCard key={stat.label}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon size={16} className="text-text-secondary" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              </span>
            </div>
            <p className="text-lg font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary">{stat.label}</p>
          </AdminCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B08968" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#B08968" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADCD6" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADCD6', background: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#B08968" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item}>
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">User Growth</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADCD6" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADCD6', background: '#fff' }} />
                  <Bar dataKey="users" fill="#D8B4A0" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="active" fill="#B08968" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item}>
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Conversion Rate</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADCD6" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7B6A65' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADCD6', background: '#fff' }} />
                  <Line type="monotone" dataKey="rate" stroke="#B08968" strokeWidth={2} dot={{ fill: '#B08968', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>

        <motion.div variants={item}>
          <AdminCard>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Sales by Category</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EADCD6', background: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <p className="text-2xl font-bold text-text-primary">100%</p>
                <p className="text-xs text-text-secondary">Total Sales</p>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-text-secondary">{item.name}</span>
                </div>
              ))}
            </div>
          </AdminCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
