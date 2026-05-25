'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      <Link
        href="/profile"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {user.firstName} {user.lastName}
      </Link>
      <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out…' : 'Log out'}
      </Button>
    </div>
  )
}
