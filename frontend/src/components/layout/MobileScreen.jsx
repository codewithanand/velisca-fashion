import { motion } from 'framer-motion'

export default function MobileScreen({ children, className = '', noPadding, ...props }) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-secondary to-background flex flex-col ${className}`} {...props}>
      {noPadding ? children : <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">{children}</div>}
    </div>
  )
}
