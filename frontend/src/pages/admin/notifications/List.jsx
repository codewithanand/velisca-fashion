import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, Send, Megaphone, ShoppingCart, User, Trash2, CheckCheck } from 'lucide-react';
import AdminCard from '../../../components/admin/AdminCard';
import AdminButton from '../../../components/admin/AdminButton';
import AdminModal from '../../../components/admin/AdminModal';
import AdminInput from '../../../components/admin/AdminInput';
import AdminSelect from '../../../components/admin/AdminSelect';
import AdminBadge from '../../../components/admin/AdminBadge';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';

const initialNotifications = [
  { id: 1, title: 'New order received', message: 'Order #ORD-008 from Sophia Chen', type: 'order', read: false, time: '5 min ago' },
  { id: 2, title: 'Low stock alert', message: 'Crystal Resin Vase is running low', type: 'alert', read: false, time: '1 hr ago' },
  { id: 3, title: 'New user registered', message: 'Emily Johnson created an account', type: 'user', read: false, time: '3 hr ago' },
  { id: 4, title: 'Payment successful', message: 'Payment for #ORD-005 confirmed', type: 'order', read: true, time: '5 hr ago' },
  { id: 5, title: 'Promotion sent', message: 'Summer Sale campaign sent to 2,450 users', type: 'promo', read: true, time: '1 day ago' },
];

const typeIcons = { order: ShoppingCart, alert: Bell, user: User, promo: Megaphone };
const typeColors = { order: 'text-blue-600 bg-blue-50', alert: 'text-amber-600 bg-amber-50', user: 'text-green-600 bg-green-50', promo: 'text-purple-600 bg-purple-50' };
const typeBadge = { order: 'info', alert: 'warning', user: 'success', promo: 'primary' };

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'promo' });
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));

  const handleSend = () => {
    setNotifications([{
      ...form,
      id: Date.now(),
      read: false,
      time: 'Just now',
    }, ...notifications]);
    setModalOpen(false);
    setForm({ title: '', message: '', type: 'promo' });
  };

  const markRead = (id) => setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));

  const deleteNotification = (id) => setNotifications(notifications.filter((n) => n.id !== id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <AdminButton variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck size={14} />
              Mark all read
            </AdminButton>
          )}
          <AdminButton size="sm" onClick={() => setModalOpen(true)}>
            <Send size={14} />
            Send Notification
          </AdminButton>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-border'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={Bell} title="No notifications" description={filter === 'unread' ? 'All caught up!' : 'No notifications yet.'} />
        </AdminCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`admin-card p-4 flex items-start gap-3 cursor-pointer ${!notification.read ? 'border-l-2 border-l-primary' : ''}`}
                onClick={() => markRead(notification.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeColors[notification.type]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${notification.read ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <AdminBadge variant={typeBadge[notification.type]} className="text-[10px]">
                        {notification.type}
                      </AdminBadge>
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                        className="p-1 rounded hover:bg-secondary transition-colors">
                        <Trash2 size={12} className="text-text-secondary" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{notification.message}</p>
                  <p className="text-[10px] text-text-secondary mt-1">{notification.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Send Notification">
        <div className="space-y-4">
          <AdminSelect label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'promo', label: 'Promotion' },
              { value: 'order', label: 'Order Update' },
              { value: 'alert', label: 'Alert' },
            ]}
          />
          <AdminInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Notification message..." rows={3} className="admin-input resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSend}>
              <Send size={14} />
              Send
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </motion.div>
  );
}
