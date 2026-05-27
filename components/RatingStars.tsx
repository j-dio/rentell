type Props = {
  rating: number | string | null | undefined
  showNumber?: boolean
}

export default function RatingStars({ rating, showNumber = true }: Props) {
  if (!rating) return null

  const value = Number(rating)
  if (isNaN(value)) return null

  const full  = Math.floor(value)
  const half  = value - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <StarFull key={`f${i}`} />
        ))}
        {half && <StarHalf />}
        {Array.from({ length: empty }).map((_, i) => (
          <StarEmpty key={`e${i}`} />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-medium text-muted-foreground">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

function StarFull() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--gold, #f59e0b)' }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarHalf() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" style={{ color: 'var(--gold, #f59e0b)' }}>
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path fill="url(#half)" stroke="currentColor" strokeWidth="1"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarEmpty() {
  return (
    <svg className="w-3.5 h-3.5 text-muted-foreground/30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
