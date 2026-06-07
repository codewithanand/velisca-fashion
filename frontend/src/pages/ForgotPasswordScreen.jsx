import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAppContext } from '../context/AppContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const { forgotPassword } = useAppContext()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

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
          <h2 className="text-xl font-semibold mt-6 mb-1">Reset Password</h2>
          <p className="text-sm text-text-secondary">
            {sent
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-success" />
            <p className="text-sm text-text-secondary text-center">
              If an account with that email exists, we've sent a password reset
              link. Please check your inbox.
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
