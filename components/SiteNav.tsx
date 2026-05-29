'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import UserNav from '@/components/UserNav'
import type { SessionUser } from '@/lib/session'

type NavItem = {
  href: string
  label: string
  /** Shorter label for narrow viewports */
  shortLabel?: string
  match: (pathname: string) => boolean
  badge?: number
}

const BASE_NAV: NavItem[] = [
  {
    href: '/housing',
    label: 'Housing',
    match: (pathname) => pathname === '/housing' || pathname.startsWith('/housing/'),
  },
  {
    href: '/carinderias',
    label: 'Carinderias',
    match: (pathname) =>
      pathname === '/carinderias' || pathname.startsWith('/carinderias/'),
  },
]

const LISTINGS_NAV: NavItem = {
  href: '/listings',
  label: 'My Listings',
  shortLabel: 'Listings',
  match: (pathname) =>
    pathname === '/listings' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/'),
}

const VISITS_NAV: NavItem = {
  href: '/visits',
  label: 'My Visits',
  shortLabel: 'Visits',
  match: (pathname) => pathname === '/visits',
}

const MESSAGES_NAV: NavItem = {
  href: '/messages',
  label: 'Messages',
  match: (pathname) => pathname === '/messages' || pathname.startsWith('/messages/'),
}

function NavPill({ items, className = '' }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname()

  return (
    <div
      className={`nav-pill-scroll relative flex min-w-0 max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border/70 bg-card/90 p-1 shadow-[0_2px_12px_-4px_rgba(26,106,70,0.12)] backdrop-blur-sm ${className}`}
      role="tablist"
      aria-label="Main sections"
    >
      {items.map((item) => {
        const isActive = item.match(pathname)

        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={`relative z-10 shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200 sm:px-3.5 sm:py-1.5 sm:text-sm lg:px-5 ${
              isActive
                ? 'text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="site-nav-highlight"
                className="absolute inset-0 rounded-full bg-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 lg:hidden">{item.shortLabel ?? item.label}</span>
            <span className="relative z-10 hidden lg:inline">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cta)] px-1 text-[10px] font-bold text-white leading-none">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

type SiteNavProps = {
  user: SessionUser | null
  unreadCount?: number
}

export default function SiteNav({ user, unreadCount = 0 }: SiteNavProps) {
  const navItems = user
    ? [...BASE_NAV, LISTINGS_NAV, VISITS_NAV, { ...MESSAGES_NAV, badge: unreadCount }]
    : BASE_NAV

  const authActions = user ? (
    <UserNav user={user} />
  ) : (
    <>
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-full px-4 py-1.5 text-sm font-semibold text-cta-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.97]"
        style={{ backgroundColor: 'var(--cta)' }}
      >
        Register
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-y border-primary/20 bg-[oklch(0.965_0.018_152)]/95 backdrop-blur-md lg:flex lg:min-h-[var(--site-header-height)] lg:items-center">
      <nav className="mx-auto grid w-full max-w-screen-2xl grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:gap-x-4 sm:px-6 sm:py-3 lg:grid-rows-1 lg:gap-x-6 lg:py-3">
        <Link href="/" className="col-start-1 row-start-1 flex shrink-0 items-center">
          <Image
            src="/rentell-logo.svg"
            alt="RenTell"
            width={148}
            height={46}
            priority
            className="h-9 w-auto sm:h-10 lg:h-12"
          />
        </Link>

        <div className="col-span-3 row-start-2 min-w-0 max-w-full overflow-hidden lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:flex lg:justify-center lg:px-2">
          <NavPill items={navItems} className="w-full lg:w-auto" />
        </div>

        <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2 sm:gap-3">
          {authActions}
        </div>
      </nav>
    </header>
  )
}
