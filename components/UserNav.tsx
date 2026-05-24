'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { SessionUser } from '@/lib/session'

interface UserNavProps {
  user: SessionUser
}

export default function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {user.firstName} {user.lastName}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out…' : 'Log out'}
      </Button>
    </div>
  )
}
