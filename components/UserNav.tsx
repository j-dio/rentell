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
        href="/favorites"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors"
        aria-label="My Favorites"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Favorites
      </Link>
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
