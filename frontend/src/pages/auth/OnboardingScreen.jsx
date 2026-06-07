import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { onboardingSlides } from '../data/onboarding'
import Button from '../components/ui/Button'

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
    <div className="min-h-screen bg-background flex flex-col">
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
            <div className="flex flex-col items-center px-6 pt-8">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full aspect-[4/5] object-cover rounded-b-[3rem] shadow-lg"
              />
              <div className="mt-8 text-center">
                <h2 className="heading-lg mb-3">{slide.title}</h2>
                <p className="body-md text-text-secondary max-w-xs mx-auto">
                  {slide.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {onboardingSlides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page ? 'w-8 bg-primary' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate('/login')}
            className="text-text-secondary text-sm font-medium"
          >
            Skip
          </button>
          <Button onClick={handleNext}>
            {isLast ? 'Get Started' : 'Next'}
            {!isLast && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
