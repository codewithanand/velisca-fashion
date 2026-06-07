import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const { forgotPassword } = useAppContext()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = `
    w-full h-14 bg-white/80 backdrop-blur-sm rounded-2xl border-2 pl-12 pr-4
    text-base text-text-primary placeholder:text-text-secondary/50
    transition-all duration-300 ease-out
    ${error ? 'border-error/60 focus:border-error' : focusedField === 'email' ? 'border-primary shadow-lg shadow-primary/15' : 'border-border/60 hover:border-border'}
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
            Reset Password
          </h1>
          <p className="text-base text-text-secondary/70 text-center mt-2">
            {sent
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a reset link'}
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

        {sent ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mt-4">
            <CheckCircle size={56} className="text-success" />
            <p className="text-sm text-text-secondary/70 text-center leading-relaxed">
              If an account with that email exists, we've sent a password reset
              link. Please check your inbox.
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
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass}
                  autoComplete="email"
                  enterKeyHint="done"
                />
              </div>
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
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  Send Reset Link
                </span>
              )}
            </motion.button>
          </motion.form>
        )}

        <motion.div variants={itemVariants} className="mt-auto pt-8 pb-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/80 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
