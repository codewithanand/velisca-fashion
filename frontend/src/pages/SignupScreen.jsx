import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAppContext } from '../context/AppContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]).{8,}$/

function validateForm(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (form.name.trim().length > 255) {
    errors.name = 'Name must not exceed 255 characters'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = 'Phone must be exactly 10 digits'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!PASSWORD_RE.test(form.password)) {
    errors.password = 'Password must include uppercase, lowercase, number & special character'
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'Please confirm your password'
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Passwords do not match'
  }

  return errors
}

const passwordRequirements = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(v) },
]

export default function SignupScreen() {
  const navigate = useNavigate()
  const { signup } = useAppContext()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = useCallback((field) => (e) => {
    let value = e.target.value
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10)
    }
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (generalError) setGeneralError('')
  }, [fieldErrors, generalError])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    setGeneralError('')
    setFieldErrors({})

    try {
      await signup(form)
      navigate('/home')
    } catch (error) {
      if (error.data?.errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(error.data.errors).map(([key, msgs]) => [key, msgs[0]])
          )
        )
      }
      setGeneralError(error.data?.message || error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
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
          <h2 className="text-xl font-semibold mt-6 mb-1">Create Account</h2>
          <p className="text-sm text-text-secondary">Join the Velisca family</p>
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
              icon={User}
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange('name')}
              error={fieldErrors.name}
            />
          </div>
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
          <div>
            <Input
              icon={Phone}
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
              error={fieldErrors.phone}
              maxLength={10}
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
            {form.password.length > 0 && (
              <div className="mt-1 space-y-1 pl-2">
                {passwordRequirements.map((req) => {
                  const met = req.test(form.password)
                  return (
                    <div key={req.label} className="flex items-center gap-1.5 text-xs">
                      {met ? (
                        <Check size={12} className="text-success shrink-0" />
                      ) : (
                        <X size={12} className="text-error shrink-0" />
                      )}
                      <span className={met ? 'text-text-secondary' : 'text-text-secondary/60'}>
                        {req.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Lock size={18} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
