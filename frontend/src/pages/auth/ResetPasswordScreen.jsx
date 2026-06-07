import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

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
  const [focusedField, setFocusedField] = useState(null)

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

  const inputClass = (field) => `
    w-full h-14 bg-white/80 backdrop-blur-sm rounded-2xl border-2 pl-12 pr-12
    text-base text-text-primary placeholder:text-text-secondary/50
    transition-all duration-300 ease-out
    ${fieldErrors[field] ? 'border-error/60 focus:border-error' : focusedField === field ? 'border-primary shadow-lg shadow-primary/15' : 'border-border/60 hover:border-border'}
    focus:outline-none
  `

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex flex-col">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-50/80 backdrop-blur-sm flex items-center justify-center">
              <AlertCircle size={40} className="text-error" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary text-center">
              Invalid Reset Link
            </h1>
            <p className="text-sm text-text-secondary/70 text-center leading-relaxed">
              This password reset link is invalid or has expired.
            </p>
            <motion.button
              onClick={() => navigate('/forgot-password')}
              className={`
                w-full h-14 rounded-2xl font-semibold text-base text-white mt-2
                bg-gradient-to-r from-primary to-primary-dark
                shadow-xl shadow-primary/25
                transition-all duration-300 ease-out
                flex items-center justify-center gap-2.5
                hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
              `}
              whileTap={{ scale: 0.97 }}
            >
              Request New Link
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

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

        <motion.div variants={itemVariants} className="mt-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary text-center">
            Set New Password
          </h1>
          <p className="text-base text-text-secondary/70 text-center mt-2">
            Choose a strong password for your account
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-4 py-3.5 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl flex items-start gap-2.5 text-sm text-red-600"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mt-4">
            <CheckCircle size={56} className="text-success" />
            <p className="text-sm text-text-secondary/70 text-center leading-relaxed">
              Your password has been reset successfully.
            </p>
            <motion.button
              onClick={() => navigate('/login')}
              className={`
                w-full h-14 rounded-2xl font-semibold text-base text-white mt-4
                bg-gradient-to-r from-primary to-primary-dark
                shadow-xl shadow-primary/25
                transition-all duration-300 ease-out
                flex items-center justify-center gap-2.5
                hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
              `}
              whileTap={{ scale: 0.97 }}
            >
              Back to Login
            </motion.button>
          </motion.div>
        ) : (
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <motion.div variants={itemVariants}>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  disabled
                  className="w-full h-14 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-border/40 pl-12 pr-4 text-base text-text-secondary/60 placeholder:text-text-secondary/30 cursor-not-allowed focus:outline-none"
                />
              </div>
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
                  placeholder="New Password"
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
                  placeholder="Confirm New Password"
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
                  Resetting...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  Reset Password
                </span>
              )}
            </motion.button>
          </motion.form>
        )}

        {!success && (
          <motion.div variants={itemVariants} className="mt-auto pt-8 pb-4 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary/80 hover:text-primary transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
