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
  match: (pathname: string) => boolean
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

const DASHBOARD_NAV: NavItem = {
  href: '/dashboard',
  label: 'Dashboard',
  match: (pathname) => pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
}

const VISITS_NAV: NavItem = {
  href: '/visits',
  label: 'My Visits',
  match: (pathname) => pathname === '/visits',
}

function NavPill({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <div
      className="relative flex items-center gap-0.5 rounded-full border border-border/70 bg-card/90 p-1 shadow-[0_2px_12px_-4px_rgba(26,106,70,0.12)] backdrop-blur-sm"
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
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
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
            <span className="relative z-10">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

type SiteNavProps = {
  user: SessionUser | null
}

export default function SiteNav({ user }: SiteNavProps) {
  const navItems = user
    ? user.isHost
      ? [...BASE_NAV, DASHBOARD_NAV, VISITS_NAV]
      : [...BASE_NAV, VISITS_NAV]
    : BASE_NAV

  return (
    <header className="sticky top-0 z-40 h-[var(--site-header-height)] border-y border-primary/20 bg-[oklch(0.965_0.018_152)]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/rentell-logo.svg"
              alt="RenTell"
              width={148}
              height={46}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>
          <NavPill items={navItems} />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
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
          )}
        </div>
      </nav>
    </header>
  )
}
