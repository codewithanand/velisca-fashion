import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading } = useAppContext()
  const hasNavigated = useRef(false)

  useEffect(() => {
    const MIN_DISPLAY_MS = 2000
    const start = Date.now()

    const decide = () => {
      if (hasNavigated.current) return
      hasNavigated.current = true
      if (isAuthenticated) {
        navigate('/home', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }

    if (!isAuthLoading) {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      setTimeout(decide, remaining)
    }

    // Fallback: navigate after 2.5s regardless
    const fallback = setTimeout(decide, 2500)

    return () => {
      clearTimeout(fallback)
    }
  }, [navigate, isAuthenticated, isAuthLoading])

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold tracking-widest text-text-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          VELISCA
        </motion.h1>
        <motion.p
          className="text-text-secondary text-lg mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          Wear Your Aura
        </motion.p>
      </div>
    </div>
  )
}
