import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../../context/admin/AdminContext';
import api from '../../services/api';
import { setAccessToken, setRefreshToken } from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { admin, setAdmin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (admin) navigate('/admin', { replace: true });
  }, [admin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        device_name: 'admin-panel',
      });

      const { user, access_token, refresh_token: newRefreshToken } = response.data || {};

      if (!user?.role) {
        setError('Invalid user data received. Please try again.');
        setLoading(false);
        return;
      }

      const allowedRoles = ['admin', 'staff'];
      if (!allowedRoles.includes(user.role)) {
        setError('Access denied. Admin/Staff credentials required.');
        setLoading(false);
        return;
      }

      setAccessToken(access_token);
      setRefreshToken(newRefreshToken);
      setAdmin(user);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err.status === 401 || err.status === 422) {
        setError(err.data?.message || 'Invalid email or password');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="admin-card p-8"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>
        <p className="text-sm text-text-secondary mt-1">Velisca Admin Panel</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@velisca.com"
            className="admin-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="admin-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-danger bg-red-50 rounded-lg px-3 py-2">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-primary w-full justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={16} />
              Sign In
            </span>
          )}
        </button>
      </form>

      <p className="text-xs text-text-secondary text-center mt-6">
        Demo: admin@velisca.com / admin123 (Admin) or staff@velisca.com / staff123 (Staff)
      </p>
    </motion.div>
  );
}
