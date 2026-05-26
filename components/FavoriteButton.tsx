'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md transition-all disabled:opacity-50 hover:scale-110 ${
        favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
    >
      <span className="text-lg leading-none">{favorited ? '♥' : '♡'}</span>
    </button>
  )
}
