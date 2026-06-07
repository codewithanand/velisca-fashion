import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Bell, Shield, FileText, Info, LogOut, LogOut as LogOutAllIcon, ToggleLeft, ToggleRight, ChevronRight, LoaderCircle } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

function SettingRow({ icon: Icon, label, right, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 px-4 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <Icon size={20} className="text-text-primary" />
      </div>
      <span className="flex-1 text-left text-text-primary font-medium">{label}</span>
      {right}
    </button>
  )
}

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={onChange} className="text-text-secondary">
      {enabled ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} />}
    </button>
  )
}

export default function SettingsScreen() {
  const navigate = useNavigate()
  const { logout, logoutAll } = useAppContext()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background px-4 pt-6 pb-8">
      <h1 className="heading-md mb-6">Settings</h1>

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-4">
          Appearance
        </h2>
        <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl divide-y divide-border/60 shadow-sm">
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            right={<Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          />
          <SettingRow
            icon={Bell}
            label="Notifications"
            right={<Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} />}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-4">
          Account
        </h2>
        <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl divide-y divide-border/60 shadow-sm">
          <SettingRow
            icon={LogOut}
            label="Logout"
            onClick={handleLogout}
            disabled={loggingOut}
            right={
              loggingOut
                ? <LoaderCircle size={18} className="animate-spin text-text-secondary" />
                : <span className="text-sm font-medium text-error">Logout</span>
            }
          />
          <SettingRow
            icon={LogOutAllIcon}
            label="Logout from all devices"
            onClick={handleLogoutAll}
            disabled={loggingOutAll}
            right={
              loggingOutAll
                ? <LoaderCircle size={18} className="animate-spin text-text-secondary" />
                : <span className="text-sm font-medium text-error">Logout All</span>
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-4">
          About
        </h2>
        <div className="bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl divide-y divide-border/60 shadow-sm">
          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            right={<ChevronRight size={18} className="text-text-secondary" />}
          />
          <SettingRow
            icon={FileText}
            label="Terms of Service"
            right={<ChevronRight size={18} className="text-text-secondary" />}
          />
          <SettingRow
            icon={Info}
            label="App Version"
            right={<span className="text-sm text-text-secondary">1.0.0</span>}
          />
        </div>
      </section>
    </div>
  )
}
