'use client'

import Link from 'next/link'
import type { SessionUser } from '@/lib/session'
import { getUserAvatarStyle } from '@/lib/userAvatar'

interface UserNavProps {
  user: SessionUser
}

export default function UserNav({ user }: UserNavProps) {
  const avatarStyle = getUserAvatarStyle(user.userId)
  const initial = user.firstName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="flex items-center gap-2 sm:gap-3">
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
        <span className="hidden md:inline">Favorites</span>
      </Link>
      <Link
        href="/profile"
        aria-label={`Profile: ${user.firstName} ${user.lastName}`}
        title={`${user.firstName} ${user.lastName}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase leading-none shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-90"
        style={avatarStyle}
      >
        {initial}
      </Link>
    </div>
  )
}
