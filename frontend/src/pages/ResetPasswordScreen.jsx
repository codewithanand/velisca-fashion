import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAppContext } from '../context/AppContext'

export default function ResetPasswordScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAppContext()

  const emailFromUrl = searchParams.get('email') || ''
  const tokenFromUrl = searchParams.get('token') || ''

  const [form, setForm] = useState({
    email: emailFromUrl,
    token: tokenFromUrl,
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const errors = {}
    if (!form.password) {
      errors.password = 'Password is required'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!form.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password'
    } else if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      await resetPassword({
        email: form.email,
        token: form.token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
    } catch (err) {
      if (err.data?.errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(err.data.errors).map(([key, msgs]) => [key, msgs[0]])
          )
        )
      }
      setError(err.data?.message || err.message || 'Password reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-text-secondary mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button fullWidth onClick={() => navigate('/forgot-password')}>
            Request New Link
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
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
          <h2 className="text-xl font-semibold mt-6 mb-1">Set New Password</h2>
          <p className="text-sm text-text-secondary">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-success" />
            <p className="text-sm text-text-secondary text-center">
              Your password has been reset successfully.
            </p>
            <Button fullWidth onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={form.email}
              disabled
            />

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
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

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={form.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  className={`w-full bg-card rounded-2xl border ${
                    fieldErrors.password_confirmation ? 'border-error' : 'border-border'
                  } focus:border-primary focus:ring-1 focus:ring-primary pl-11 pr-12 py-3 text-text-primary placeholder:text-text-secondary transition-colors duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password_confirmation && (
                <p className="text-xs text-error pl-2">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <Button type="submit" fullWidth className="mt-2" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
