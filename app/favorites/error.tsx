'use client'

import { useEffect } from 'react'

export default function FavoritesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
        <svg className="w-8 h-8 text-destructive/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">Could not load favorites</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The database is waking up — this happens after a period of inactivity. Please try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all"
      >
        Retry
      </button>
    </main>
  )
}
