/** Deterministic avatar colors from RenTell brand palette */
const BRAND_AVATAR_COLORS = [
  { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
  { backgroundColor: 'var(--cta)', color: 'var(--cta-foreground)' },
  { backgroundColor: 'var(--gold)', color: 'var(--foreground)' },
  { backgroundColor: 'var(--secondary-foreground)', color: '#ffffff' },
  { backgroundColor: 'oklch(0.55 0.11 155)', color: '#ffffff' },
] as const

export function getUserAvatarStyle(userId: number): {
  backgroundColor: string
  color: string
} {
  const index = Math.abs(userId) % BRAND_AVATAR_COLORS.length
  return BRAND_AVATAR_COLORS[index]
}
