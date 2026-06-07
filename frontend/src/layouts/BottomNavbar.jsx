import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const tabs = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/categories', icon: Grid, label: 'Categories' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/cart', icon: ShoppingBag, label: 'Cart' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNavbar() {
  const { cartCount } = useAppContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-4 flex justify-center pointer-events-none">
      <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-border/50 px-3 py-1.5 flex items-center justify-between max-w-md w-full mx-4 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center px-3 py-1.5 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-primary bg-secondary'
                    : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <div className="relative">
                <Icon size={20} />
                {tab.label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
