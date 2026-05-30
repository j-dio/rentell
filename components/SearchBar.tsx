'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'Name, address, description…' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  function apply() {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    apply()
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`?${params.toString()}`)
  }

  const hasActiveQuery = !!searchParams.get('q')?.trim()

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="px-4 pt-4 pb-3 sm:px-5">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Search
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-lg border border-border bg-muted pl-8 pr-9 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-transparent focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            {hasActiveQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="h-7 rounded-full border border-border px-3 text-xs text-muted-foreground transition-all hover:border-destructive/40 hover:text-destructive active:scale-95"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="h-7 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
