import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import useAuthStore from '../../stores/auth.store';

const AdminContext = createContext(null);

function loadAdmin() {
  try {
    const data = localStorage.getItem('admin');
    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem('admin');
    return null;
  }
}

const initialState = {
  sidebarOpen: false,
  theme: localStorage.getItem('admin_theme') || 'light',
  admin: loadAdmin(),
  products: [],
  orders: [],
  users: [],
  categories: [],
  coupons: [],
  banners: [],
  notifications: [],
  loading: false,
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_ADMIN':
      return { ...state, admin: action.payload, loading: false };
    case 'LOGOUT_ADMIN':
      return { ...state, admin: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_COUPONS':
      return { ...state, coupons: action.payload };
    case 'SET_BANNERS':
      return { ...state, banners: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    default:
      return state;
  }
}

const STAFF_ROLES = ['admin', 'staff'];

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebarOpen = useCallback((open) => dispatch({ type: 'SET_SIDEBAR', payload: open }), []);
  const setTheme = useCallback((theme) => dispatch({ type: 'SET_THEME', payload: theme }), []);
  const setAdmin = useCallback((admin) => {
    localStorage.setItem('admin', JSON.stringify(admin));
    dispatch({ type: 'SET_ADMIN', payload: admin });
    // Sync with auth store
    useAuthStore.getState().setUser(admin);
    if (admin?.permissions) {
      useAuthStore.getState().setPermissions(admin.permissions);
    }
  }, []);
  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('admin');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT_ADMIN' });
    useAuthStore.getState().logout();
  }, []);
  const setProducts = useCallback((products) => dispatch({ type: 'SET_PRODUCTS', payload: products }), []);
  const setOrders = useCallback((orders) => dispatch({ type: 'SET_ORDERS', payload: orders }), []);
  const setUsers = useCallback((users) => dispatch({ type: 'SET_USERS', payload: users }), []);
  const setCategories = useCallback((categories) => dispatch({ type: 'SET_CATEGORIES', payload: categories }), []);
  const setCoupons = useCallback((coupons) => dispatch({ type: 'SET_COUPONS', payload: coupons }), []);
  const setBanners = useCallback((banners) => dispatch({ type: 'SET_BANNERS', payload: banners }), []);
  const setNotifications = useCallback((notifications) => dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications }), []);

  const hasRole = useCallback((role) => state.admin?.role === role, [state.admin]);
  const hasAnyRole = useCallback((roles) => roles.includes(state.admin?.role), [state.admin]);
  const isSuperAdmin = useCallback(() => state.admin?.role === 'admin', [state.admin]);

  const hasPermission = useCallback((permission) => {
    const permissions = state.admin?.permissions || [];
    if (state.admin?.role === 'admin') return true;
    return permissions.some((p) => p.name === permission || p === permission);
  }, [state.admin]);

  const value = useMemo(() => ({
    ...state,
    isAdmin: state.admin !== null && STAFF_ROLES.includes(state.admin?.role),
    isStaff: state.admin !== null,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    setAdmin,
    logoutAdmin,
    setProducts,
    setOrders,
    setUsers,
    setCategories,
    setCoupons,
    setBanners,
    setNotifications,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    hasPermission,
  }), [state, toggleSidebar, setSidebarOpen, setTheme, setAdmin, logoutAdmin,
      setProducts, setOrders, setUsers, setCategories, setCoupons, setBanners, setNotifications,
      hasRole, hasAnyRole, isSuperAdmin, hasPermission]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}

export { STAFF_ROLES };
