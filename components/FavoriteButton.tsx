'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Props = {
  listingType: 'housing' | 'carinderia'
  listingId: number
  initialFavorited: boolean
}

export default function FavoriteButton({ listingType, listingId, initialFavorited }: Props) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_type: listingType, listing_id: listingId }),
      })

      if (res.ok) {
        setFavorited(!favorited)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md transition-colors disabled:opacity-50 ${
        favorited ? 'text-cta' : 'text-muted-foreground hover:text-cta'
      }`}
      whileTap={{ scale: 0.82 }}
    >
      <motion.span
        key={favorited ? 'filled' : 'empty'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className="text-lg leading-none"
      >
        {favorited ? '♥' : '♡'}
      </motion.span>
    </motion.button>
  )
}
