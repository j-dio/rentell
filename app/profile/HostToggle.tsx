'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HostToggle({ isHost }: { isHost: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justBecameHost, setJustBecameHost] = useState(false)

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
        setJustBecameHost(true)
      } else {
        setJustBecameHost(false)
      }
      router.refresh()
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
      {justBecameHost && isHost && (
        <p className="text-sm text-green-700">
          You&apos;re now a host!{' '}
          <Link href="/dashboard/new" className="underline font-medium">
            Add your first listing
          </Link>
          .
        </p>
      )}
      {isHost && !justBecameHost && (
        <p className="text-xs text-muted-foreground">
          Your listings remain in the directory while your host account is active.
        </p>
      )}
    </div>
  )
}
