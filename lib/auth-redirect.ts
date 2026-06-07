import { redirect } from 'next/navigation'

/** Keep in sync with middleware PROTECTED_PREFIXES */
export const PROTECTED_ROUTE_PREFIXES = [
  '/favorites',
  '/profile',
  '/visits',
  '/messages',
  '/host',
  '/listings',
  '/carinderias/new',
  '/dashboard',
  '/onboarding',
] as const

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/'
  return path.split('?')[0] ?? '/'
}

export function isProtectedPath(path: string): boolean {
  const normalized = safeRedirectPath(path)
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
}

export function signUpRedirect(path: string): string {
  return `/register?from=${encodeURIComponent(safeRedirectPath(path))}`
}

export function guardedHref(path: string, isLoggedIn: boolean): string {
  if (isLoggedIn || !isProtectedPath(path)) return path
  return signUpRedirect(path)
}

export function redirectToSignUp(path: string): never {
  redirect(signUpRedirect(path))
}
