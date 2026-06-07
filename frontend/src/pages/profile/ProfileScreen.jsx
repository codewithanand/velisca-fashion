import { useState } from 'react'
import { ShoppingBag, Heart, MapPin, Settings, LogOut, LogOut as LogOutAllIcon, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProfileMenuItem from '../../components/ui/ProfileMenuItem'
import { useAppContext } from '../../context/AppContext'

const menuItems = [
  { icon: ShoppingBag, label: 'Orders', path: '/orders' },
  { icon: Heart, label: 'My Wishlist', path: '/wishlist' },
  { icon: MapPin, label: 'Address', path: '/addresses' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function ProfileScreen() {
  const { user, logout, logoutAll } = useAppContext()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U'

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  const handleLogoutAll = async () => {
    setLoggingOutAll(true)
    await logoutAll()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background px-4 pt-8 pb-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/25">
          <span className="text-4xl font-bold text-white">{initials}</span>
        </div>
        <h1 className="heading-md mt-4">{user?.name || 'User'}</h1>
        <p className="body-sm">{user?.email || ''}</p>
        {user?.phone && (
          <p className="body-sm text-text-secondary mt-0.5">{user.phone}</p>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm p-2 space-y-1">
        {menuItems.map((item) => (
          <ProfileMenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm p-2 space-y-1">
        <ProfileMenuItem
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
          disabled={loggingOut}
          right={loggingOut ? <LoaderCircle size={18} className="animate-spin text-text-secondary" /> : undefined}
        />
        <ProfileMenuItem
          icon={LogOutAllIcon}
          label="Logout from all devices"
          onClick={handleLogoutAll}
          disabled={loggingOutAll}
          right={loggingOutAll ? <LoaderCircle size={18} className="animate-spin text-text-secondary" /> : undefined}
        />
      </div>
    </div>
  )
}
