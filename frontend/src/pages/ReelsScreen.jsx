import { useState, useRef, useCallback, useEffect } from 'react'
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'

const sampleReels = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=900&fit=crop',
    product: 'Floral Modal Kurti',
    price: '₹1,299',
    likes: '12.4k',
    liked: false,
    saved: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1604890532358-74e6b394ced6?w=600&h=900&fit=crop',
    product: 'Anarkali Party Wear Dress',
    price: '₹2,499',
    likes: '8.7k',
    liked: false,
    saved: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=900&fit=crop',
    product: 'Geometric Print A-Line Dress',
    price: '₹1,999',
    likes: '5.2k',
    liked: false,
    saved: false,
  },
]

function Reel({ reel, isActive }) {
  const [liked, setLiked] = useState(reel.liked)
  const [saved, setSaved] = useState(reel.saved)
  const [muted, setMuted] = useState(true)

  return (
    <div className="relative w-full h-[100dvh] snap-start shrink-0">
      <img
        src={reel.image}
        alt={reel.product}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {isActive && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-12 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
        >
          {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
        </button>
      )}

      <div className="absolute bottom-24 left-0 right-0 px-4 z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white" />
          <span className="text-white font-semibold text-sm">velisca</span>
          <button className="border border-white text-white text-xs font-semibold px-3 py-1 rounded-full">
            Follow
          </button>
        </div>
        <p className="text-white text-sm mt-2">
          {reel.product} - <span className="font-semibold">{reel.price}</span>
        </p>
      </div>

      <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-5">
        <motion.button
          whileTap={{ scale: 1.2 }}
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-0.5"
        >
          <Heart
            size={28}
            className={liked ? 'fill-red-500 text-red-500' : 'text-white'}
          />
          <span className="text-white text-xs">{reel.likes}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 1.2 }} className="flex flex-col items-center gap-0.5">
          <MessageCircle size={28} className="text-white" />
          <span className="text-white text-xs">Comment</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 1.2 }}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark
            size={28}
            className={saved ? 'fill-white text-white' : 'text-white'}
          />
        </motion.button>
      </div>
    </div>
  )
}

export default function ReelsScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight)
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black"
    >
      {sampleReels.map((reel, index) => (
        <Reel key={reel.id} reel={reel} isActive={index === activeIndex} />
      ))}
    </div>
  )
}
