import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminInput from '../../components/admin/AdminInput';
import AdminSelect from '../../components/admin/AdminSelect';
import AdminLoader from '../../components/admin/AdminLoader';
import useUsersStore from '../../stores/users.store';
import useRolesStore from '../../stores/roles.store';

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUser, updateUser } = useUsersStore();
  const { fetchAllRoles } = useRolesStore();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: '',
    status: 'active',
    roles: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, rolesData] = await Promise.all([fetchUser(id), fetchAllRoles()]);
        setRoles(rolesData);
        setForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '',
          password_confirmation: '',
          role: userData.roles?.[0]?.name || userData.role || '',
          status: userData.role === 'blocked' ? 'blocked' : 'active',
          roles: userData.roles?.map((r) => r.name) || [],
        });
      } catch {
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchUser, fetchAllRoles, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (form.password && form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        roles: form.role ? [form.role] : [],
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      const user = await updateUser(id, payload);
      navigate(`/admin/users/${user.id}`);
    } catch (err) {
      if (err.data?.errors) {
        const apiErrors = {};
        Object.entries(err.data.errors).forEach(([key, msgs]) => {
          apiErrors[key] = msgs[0];
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: err.message || 'Failed to update user' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Edit User</h1>
          <p className="text-sm text-text-secondary">Update user information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard>
              <h3 className="text-base font-semibold text-text-primary mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                />
                <AdminInput
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                />
                <AdminInput
                  label="Phone"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                />
                <AdminSelect
                  label="Status"
                  value={form.status}
                  onChange={handleChange('status')}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'blocked', label: 'Blocked' },
                  ]}
                />
              </div>
            </AdminCard>

            <AdminCard>
              <h3 className="text-base font-semibold text-text-primary mb-4">Change Password</h3>
              <p className="text-xs text-text-secondary mb-4">Leave blank to keep current password</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                />
                <AdminInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  value={form.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  error={errors.password_confirmation}
                />
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard>
              <h3 className="text-base font-semibold text-text-primary mb-4">Role</h3>
              <AdminSelect
                label="Assign Role"
                value={form.role}
                onChange={handleChange('role')}
                options={roles.map((r) => ({ value: r.name, label: r.name }))}
                placeholder="Select role..."
                error={errors.role}
              />
            </AdminCard>

            <AdminCard className="sticky top-24">
              <div className="space-y-3">
                {errors.submit && (
                  <div className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{errors.submit}</div>
                )}
                <AdminButton type="submit" fullWidth disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={16} />
                      Update User
                    </span>
                  )}
                </AdminButton>
              </div>
            </AdminCard>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
