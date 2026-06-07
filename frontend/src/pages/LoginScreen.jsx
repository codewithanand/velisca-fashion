import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAppContext } from '../context/AppContext'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAppContext()
  const [form, setForm] = useState({ email: '', password: '', device_name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setFieldErrors({})

    const payload = {
      ...form,
      device_name: form.device_name || navigator.userAgent || 'Unknown device',
    }
    try {
      await login(payload)
      navigate('/home')
    } catch (error) {
      if (error.data?.errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(error.data.errors).map(([key, msgs]) => [key, msgs[0]])
          )
        )
      }
      setGeneralError(error.data?.message || error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-text-primary">
            VELISCA
          </h1>
          <h2 className="text-xl font-semibold mt-6 mb-1">Welcome Back</h2>
          <p className="text-sm text-text-secondary">Sign in to continue</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange('email')}
              error={fieldErrors.email}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange('password')}
                className={`w-full bg-card rounded-2xl border ${
                  fieldErrors.password ? 'border-error' : 'border-border'
                } focus:border-primary focus:ring-1 focus:ring-primary pl-11 pr-12 py-3 text-text-primary placeholder:text-text-secondary transition-colors duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-error pl-2">{fieldErrors.password}</p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" fullWidth onClick={() => {}} disabled={isLoading}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
