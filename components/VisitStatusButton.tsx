'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  visitId: number
  status: 'confirmed' | 'declined'
  label: string
}

export default function VisitStatusButton({ visitId, status, label }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(typeof data.error === 'string' ? data.error : 'Action failed')
        return
      }

      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        variant={status === 'confirmed' ? 'default' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className={status === 'declined' ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
      >
        {loading ? `${label}…` : label}
      </Button>
    </div>
  )
}
