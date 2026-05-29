'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const HOUSING_TYPES = [
  { value: 'dormitory',      label: 'Dormitory' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'apartment',      label: 'Apartment' },
]

const SORT_OPTIONS = [
  { value: '',           label: 'Newest first' },
  { value: 'proximity',  label: 'Nearest campus' },
  { value: 'avg_rating', label: 'Highest rated' },
]

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

type Props = { amenities: string[] }

type FilterState = {
  q:                 string
  type:              string
  priceMin:          string
  priceMax:          string
  proximity:         string
  selectedAmenities: string[]
  availableOnly:     boolean
  sort:              string
}

function readFromParams(sp: ReturnType<typeof useSearchParams>): FilterState {
  return {
    q:                 sp.get('q')        ?? '',
    type:              sp.get('type')      ?? '',
    priceMin:          sp.get('price_min') ?? '',
    priceMax:          sp.get('price_max') ?? '',
    proximity:         sp.get('proximity') ?? '',
    selectedAmenities: sp.getAll('amenities'),
    availableOnly:     sp.get('available') === 'true',
    sort:              sp.get('sort')      ?? '',
  }
}

export default function HousingFilterPanel({ amenities }: Props) {
  const router     = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(() => readFromParams(searchParams))

  useEffect(() => {
    setFilters(readFromParams(searchParams))
  }, [searchParams])

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function toggleAmenity(name: string) {
    setFilters((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(name)
        ? prev.selectedAmenities.filter((a) => a !== name)
        : [...prev.selectedAmenities, name],
    }))
  }

  function apply() {
    const params = new URLSearchParams()
    if (filters.q.trim())      params.set('q',         filters.q.trim())
    if (filters.type)          params.set('type',       filters.type)
    if (filters.priceMin)      params.set('price_min',  filters.priceMin)
    if (filters.priceMax)      params.set('price_max',  filters.priceMax)
    if (filters.proximity)     params.set('proximity',  filters.proximity)
    if (filters.availableOnly) params.set('available',  'true')
    if (filters.sort)          params.set('sort',       filters.sort)
    for (const a of filters.selectedAmenities) params.append('amenities', a)
    router.push(`?${params.toString()}`)
  }

  function reset() {
    router.push('?')
  }

  const hasActiveFilters = !!(
    filters.q || filters.type || filters.priceMin || filters.priceMax ||
    filters.proximity || filters.selectedAmenities.length || filters.availableOnly || filters.sort
  )

  return (
    <div className="w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* ── Row 1: main filters ── */}
      <div className="grid grid-cols-1 gap-3 px-4 pt-4 pb-3 sm:px-5 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_14rem_9rem]">

        {/* Search */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Search
          </p>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => set('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
              placeholder="Name, address, description…"
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-card transition-colors"
            />
          </div>
        </div>

        {/* Housing type */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Type
          </p>
          <select
            value={filters.type}
            onChange={(e) => set('type', e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors cursor-pointer appearance-none"
            style={{
              backgroundImage: CHEVRON_SVG,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '13px',
              paddingRight: '30px',
            }}
          >
            <option value="">All types</option>
            {HOUSING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Monthly price (₱)
          </p>
          <div className="flex items-center h-10 rounded-lg border border-border bg-muted focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent focus-within:bg-card transition-colors overflow-hidden">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => set('priceMin', e.target.value)}
              className="flex-1 h-full px-3 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none w-0 min-w-0"
            />
            <span className="text-border text-sm select-none shrink-0">|</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => set('priceMax', e.target.value)}
              className="flex-1 h-full px-3 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none w-0 min-w-0"
            />
          </div>
        </div>

        {/* Proximity */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Max distance
          </p>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Any"
              value={filters.proximity}
              onChange={(e) => set('proximity', e.target.value)}
              className="w-full h-10 pl-3 pr-9 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-card transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none select-none">
              km
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* ── Row 2: amenity pills + secondary controls ── */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Amenity pills — full width on small screens so pills wrap horizontally */}
        {amenities.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:flex-1">
            {amenities.map((name) => {
              const active = filters.selectedAmenities.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className={`h-7 shrink-0 whitespace-nowrap px-3 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {name}
                  {active && <span className="ml-1 opacity-60 text-[10px]">✕</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Secondary controls — own row on small screens, inline on large */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">

          {/* Available only */}
          <button
            type="button"
            onClick={() => set('availableOnly', !filters.availableOnly)}
            className={`h-7 px-3 rounded-full text-xs font-medium border transition-all active:scale-95 flex items-center gap-1.5 ${
              filters.availableOnly
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border text-[8px] transition-colors ${
              filters.availableOnly ? 'bg-white/30 border-white/50' : 'border-border'
            }`}>
              {filters.availableOnly ? '✓' : ''}
            </span>
            Available only
          </button>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => set('sort', e.target.value)}
            className="h-7 pl-3 rounded-full border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
            style={{
              backgroundImage: CHEVRON_SVG,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '11px',
              paddingRight: '26px',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={reset}
              className="h-7 px-3 rounded-full border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 active:scale-95 transition-all"
            >
              Clear all
            </button>
          )}

          {/* Apply */}
          <button
            type="button"
            onClick={apply}
            className="h-7 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
