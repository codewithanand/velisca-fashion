import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'

const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop',
    span: 'h-[320px]',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1604890532358-74e6b394ced6?w=600&h=1000&fit=crop',
    span: 'h-[400px]',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop',
    span: 'h-[280px]',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=900&fit=crop',
    span: 'h-[360px]',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop',
    span: 'h-[300px]',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1608628697045-5e2f4a0fa7c7?w=600&h=850&fit=crop',
    span: 'h-[340px]',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=720&fit=crop',
    span: 'h-[290px]',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=880&fit=crop',
    span: 'h-[350px]',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=780&fit=crop',
    span: 'h-[310px]',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=920&fit=crop',
    span: 'h-[370px]',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1602753324560-5c8c8b57a367?w=600&h=760&fit=crop',
    span: 'h-[305px]',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=840&fit=crop',
    span: 'h-[335px]',
  },
]

function GalleryCard({ image }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden mb-4 shadow-sm backdrop-blur-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={image.src}
        alt=""
        className={`w-full object-cover ${image.span}`}
        loading="lazy"
      />
      {hovered && (
        <div className="absolute inset-0 bg-black/30 flex items-start justify-end p-3 transition-opacity">
          <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
            <Bookmark size={16} className="text-text-primary" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function GalleryScreen() {
  const leftColumn = galleryImages.filter((_, i) => i % 2 === 0)
  const rightColumn = galleryImages.filter((_, i) => i % 2 === 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="px-4 pt-6 pb-4">
        <h1 className="heading-md">Inspiration</h1>
        <p className="body-sm mt-1">Fashion ideas and trends</p>
      </div>

      <div className="px-4 pb-6">
        <div className="columns-2 gap-4">
          {leftColumn.map((image) => (
            <GalleryCard key={image.id} image={image} />
          ))}
          {rightColumn.map((image) => (
            <GalleryCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </div>
  )
}
