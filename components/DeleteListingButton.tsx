'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { housingId: number; listingName: string }

export default function DeleteListingButton({ housingId, listingName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${listingName}"? This cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    const res = await fetch(`/api/host/housing/${housingId}`, { method: 'DELETE' })
    setLoading(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete listing. Please try again.')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 text-sm text-destructive border border-destructive/40 px-3 py-1 rounded-md hover:bg-destructive/10 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
