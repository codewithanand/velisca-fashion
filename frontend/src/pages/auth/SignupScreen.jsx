import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

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

const fieldVariants = {
  focus: { scale: 1.01, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  blur: { scale: 1 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
}

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
  const [focusedField, setFocusedField] = useState(null)

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

  const inputClass = (field) => `
    w-full h-14 bg-white/80 backdrop-blur-sm rounded-2xl border-2 pl-12 pr-12
    text-base text-text-primary placeholder:text-text-secondary/50
    transition-all duration-300 ease-out
    ${fieldErrors[field] ? 'border-error/60 focus:border-error' : focusedField === field ? 'border-primary shadow-lg shadow-primary/15' : 'border-border/60 hover:border-border'}
    focus:outline-none
  `

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex flex-col">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col px-6 pt-16 pb-8 max-w-md mx-auto w-full"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center pt-4 pb-2">
          <motion.img
            src="/logo.png"
            alt="Velisca"
            className="w-20 h-20"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 120, damping: 14 }}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary text-center">
            Create Account
          </h1>
          <p className="text-base text-text-secondary/70 text-center mt-2">
            Join the Velisca family
          </p>
        </motion.div>

        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-4 py-3.5 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl flex items-start gap-2.5 text-sm text-red-600"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{generalError}</span>
          </motion.div>
        )}

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <motion.div
            animate={focusedField === 'name' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange('name')}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={inputClass('name')}
                autoComplete="name"
                enterKeyHint="next"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-error mt-1.5 ml-1">{fieldErrors.name}</p>
            )}
          </motion.div>

          <motion.div
            animate={focusedField === 'email' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={inputClass('email')}
                autoComplete="email"
                enterKeyHint="next"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-error mt-1.5 ml-1">{fieldErrors.email}</p>
            )}
          </motion.div>

          <motion.div
            animate={focusedField === 'phone' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange('phone')}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={inputClass('phone')}
                autoComplete="tel"
                enterKeyHint="next"
                maxLength={10}
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-xs text-error mt-1.5 ml-1">{fieldErrors.phone}</p>
            )}
          </motion.div>

          <motion.div
            animate={focusedField === 'password' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={inputClass('password')}
                autoComplete="new-password"
                enterKeyHint="next"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary transition-colors z-10 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-error mt-1.5 ml-1">{fieldErrors.password}</p>
            )}
            {form.password.length > 0 && (
              <div className="mt-3 space-y-1.5 ml-1">
                {passwordRequirements.map((req) => {
                  const met = req.test(form.password)
                  return (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      {met ? (
                        <Check size={13} className="text-success shrink-0" />
                      ) : (
                        <X size={13} className="text-error/70 shrink-0" />
                      )}
                      <span className={met ? 'text-text-secondary/70' : 'text-text-secondary/50'}>
                        {req.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            animate={focusedField === 'password_confirmation' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <Lock size={20} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.password_confirmation}
                onChange={handleChange('password_confirmation')}
                onFocus={() => setFocusedField('password_confirmation')}
                onBlur={() => setFocusedField(null)}
                className={inputClass('password_confirmation')}
                autoComplete="new-password"
                enterKeyHint="done"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary transition-colors z-10 p-1"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password_confirmation && (
              <p className="text-xs text-error mt-1.5 ml-1">{fieldErrors.password_confirmation}</p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`
              w-full h-14 rounded-2xl font-semibold text-base text-white mt-2
              bg-gradient-to-r from-primary to-primary-dark
              shadow-xl shadow-primary/25
              transition-all duration-300 ease-out
              flex items-center justify-center gap-2.5
              ${isLoading ? 'opacity-80' : 'hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'}
              disabled:cursor-not-allowed
            `}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2.5">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                Create Account
              </span>
            )}
          </motion.button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-auto pt-8 pb-4 text-center">
          <p className="text-sm text-text-secondary/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
