import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { onboardingSlides } from '../../data/onboarding'

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const [[page, direction], setPage] = useState([0, 0])
  const slide = onboardingSlides[page]
  const isLast = page === onboardingSlides.length - 1

  const paginate = (newDirection) => {
    const next = page + newDirection
    if (next < 0 || next >= onboardingSlides.length) return
    setPage([next, newDirection])
  }

  const handleNext = () => {
    if (isLast) navigate('/login')
    else paginate(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex flex-col">
      <div className="flex justify-center pt-8 pb-2">
        <img src="/logo.png" alt="Velisca" className="w-12 h-12" />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x
              if (swipe < -10000) paginate(1)
              else if (swipe > 10000) paginate(-1)
            }}
          >
            <div className="flex flex-col items-center px-6 pt-6">
              <div className="w-full rounded-[2rem] shadow-xl overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                  {slide.title}
                </h2>
                <p className="text-base text-text-secondary/70 max-w-xs mx-auto leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 flex flex-col items-center gap-6">
        <div className="flex gap-2.5">
          {onboardingSlides.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ease-out ${
                i === page ? 'w-8 h-2.5 bg-primary shadow-sm shadow-primary/40' : 'w-2.5 h-2.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-text-secondary/60 hover:text-text-secondary transition-colors px-2"
          >
            Skip
          </button>
          <motion.button
            onClick={handleNext}
            className={`
              h-14 rounded-2xl font-semibold text-base text-white px-8
              bg-gradient-to-r from-primary to-primary-dark
              shadow-xl shadow-primary/25
              transition-all duration-300 ease-out
              flex items-center justify-center gap-2.5
              hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
            `}
            whileTap={{ scale: 0.97 }}
          >
            {isLast ? 'Get Started' : 'Next'}
            {!isLast && <ArrowRight size={20} />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
