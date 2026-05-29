'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  hostId: number
  housingId: number
}

export default function MessageHostButton({ hostId, housingId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: hostId, housing_id: housingId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(typeof data.error === 'string' ? data.error : 'Could not start conversation')
        return
      }

      const { conversation_id } = await res.json()
      router.push(`/messages/${conversation_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading} variant="outline" size="sm">
        {loading ? 'Opening chat…' : 'Message host'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
