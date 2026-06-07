import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../../context/AppContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
}

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

    const fallback = setTimeout(decide, 2500)

    return () => {
      clearTimeout(fallback)
    }
  }, [navigate, isAuthenticated, isAuthLoading])

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex flex-col">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center px-6"
      >
        <motion.div variants={itemVariants}>
          <motion.img
            src="/logo.png"
            alt="Velisca"
            className="w-24 h-24"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold tracking-widest text-text-primary mt-6"
        >
          VELISCA
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-text-secondary/70 text-lg mt-3 tracking-wide"
        >
          Wear Your Aura
        </motion.p>
      </motion.div>
    </div>
  )
}
