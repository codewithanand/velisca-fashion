import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'
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

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAppContext()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [remember, setRemember] = useState(true)
  const [focusedField, setFocusedField] = useState(null)
  const emailRef = useRef(null)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setFieldErrors({})

    const payload = {
      ...form,
      remember,
      device_name: navigator.userAgent || 'Unknown device',
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

        <motion.div variants={itemVariants} className="mt-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary text-center">
            Welcome Back
          </h1>
          <p className="text-base text-text-secondary/70 text-center mt-2">
            Sign in to continue
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
            animate={focusedField === 'email' ? 'focus' : 'blur'}
            variants={fieldVariants}
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60 z-10">
                <Mail size={20} />
              </div>
              <input
                ref={emailRef}
                type="email"
                placeholder="Email address"
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
                autoComplete="current-password"
                enterKeyHint="done"
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

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary bg-white/80"
              />
              <span className="text-sm text-text-secondary/70">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary/80 hover:text-primary transition-colors px-2 py-1 -mr-2"
            >
              Forgot Password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`
              w-full h-14 rounded-2xl font-semibold text-base text-white
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
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                <LogIn size={20} />
                Sign In
              </span>
            )}
          </motion.button>
        </motion.form>

        <motion.div variants={itemVariants} className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <span className="text-xs font-medium text-text-secondary/50 tracking-wide uppercase">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </motion.div>

        <motion.button
          variants={itemVariants}
          disabled={isLoading}
          className={`
            w-full h-14 rounded-2xl font-medium text-base text-text-primary
            bg-white/90 backdrop-blur-sm
            border border-border/40
            shadow-sm hover:shadow-md
            transition-all duration-300 ease-out
            flex items-center justify-center gap-3
            ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white hover:border-border/60 active:scale-[0.98]'}
          `}
          whileTap={isLoading ? {} : { scale: 0.98 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        <motion.div variants={itemVariants} className="mt-auto pt-8 pb-4 text-center">
          <p className="text-sm text-text-secondary/60">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
