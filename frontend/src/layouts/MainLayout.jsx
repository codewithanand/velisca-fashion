import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import BottomNavbar from './BottomNavbar';
import routes from '../config/routes';
import { products } from '../data/products';
import { categories } from '../data/categories';

function findRoute(pathname) {
  const exact = routes.find((r) => r.path === pathname);
  if (exact) return exact;

  if (pathname.startsWith('/products/')) {
    return routes.find((r) => r.path === '/products/:category');
  }
  if (pathname.startsWith('/product/')) {
    return routes.find((r) => r.path === '/product/:id');
  }
  return null;
}

function resolveTitle(pathname) {
  const route = findRoute(pathname);
  if (!route) return '';

  if (pathname.startsWith('/products/')) {
    const slug = pathname.split('/products/')[1];
    const cat = categories.find((c) => c.name.toLowerCase() === slug?.toLowerCase());
    return cat?.name || slug?.charAt(0).toUpperCase() + slug?.slice(1) || '';
  }
  if (pathname.startsWith('/product/')) {
    const id = pathname.split('/product/')[1];
    const product = products.find((p) => p.id === Number(id));
    return product?.name || 'Product';
  }
  return route.title || '';
}

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useAppContext();

  const route = findRoute(pathname);
  const showBack = route?.showBack ?? true;
  const showBottomNav = route?.showBottomNav ?? true;
  const title = resolveTitle(pathname);

  const showCartAction =
    pathname !== '/cart' &&
    !pathname.startsWith('/checkout') &&
    !pathname.startsWith('/order-success');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft size={20} className="text-text-primary" />
              </button>
            )}
            {pathname === '/home' ? (
              <img src="/logo.png" alt="Velisca" className="w-8 h-8" />
            ) : (
              <h1 className="text-lg font-semibold text-text-primary truncate">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {pathname === '/home' && (
              <button
                onClick={() => navigate('/search')}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <Search size={20} className="text-text-secondary" />
              </button>
            )}
            {showCartAction && (
              <button
                onClick={() => navigate('/cart')}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ShoppingBag size={20} className="text-text-secondary" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 pb-24"><Outlet /></main>

      {showBottomNav && <BottomNavbar />}
    </div>
  );
}
