'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function HostToggle({ isHost }: { isHost: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/host-toggle', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to update')
        return
      }
      if (!isHost) {
        router.push('/dashboard')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {isHost ? (
            <span className="text-green-700 font-medium">You are a host</span>
          ) : (
            <span className="text-muted-foreground">You are not a host yet</span>
          )}
        </span>
        <Button variant={isHost ? 'outline' : 'default'} size="sm" disabled={pending} onClick={toggle}>
          {pending ? 'Updating…' : isHost ? 'Disable host account' : 'Become a host'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {isHost && (
        <p className="text-xs text-muted-foreground">
          Your listings remain in the directory while your host account is active.
        </p>
      )}
    </div>
  )
}
