import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Package, ShoppingCart, Percent, Image, BarChart3, Settings } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminLoader from '../../components/admin/AdminLoader';
import usePermissionsStore from '../../stores/permissions.store';

const groupIcons = {
  users: Users,
  products: Package,
  orders: ShoppingCart,
  coupons: Percent,
  banners: Image,
  analytics: BarChart3,
  settings: Settings,
};

export default function PermissionGroupsPage() {
  const { groupedPermissions, loading, fetchGroupedPermissions } = usePermissionsStore();

  useEffect(() => { fetchGroupedPermissions(); }, [fetchGroupedPermissions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Permission Groups</h1>
        <p className="text-sm text-text-secondary">View all permissions organized by module</p>
      </div>

      {loading ? <AdminLoader /> : Object.keys(groupedPermissions).length === 0 ? (
        <AdminCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield size={40} className="text-text-secondary/30 mb-3" />
            <h3 className="text-base font-semibold text-text-primary mb-1">No permission groups</h3>
            <p className="text-sm text-text-secondary">Permissions will appear here once configured.</p>
          </div>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedPermissions).map(([group, perms]) => {
            const groupKey = group.toLowerCase();
            const Icon = groupIcons[groupKey] || Shield;
            return (
              <AdminCard key={group} hover>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{group}</h3>
                    <AdminBadge variant="default" className="mt-1">{perms.length} permissions</AdminBadge>
                  </div>
                </div>
                <div className="space-y-1">
                  {perms.map((perm) => (
                    <div
                      key={perm.id || perm.name}
                      className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-text-primary"
                    >
                      {perm.name}
                    </div>
                  ))}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
