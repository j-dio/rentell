'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const HOUSING_TYPES = [
  { value: 'dormitory',     label: 'Dormitory' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'apartment',     label: 'Apartment' },
]

const SORT_OPTIONS = [
  { value: '',           label: 'Newest first' },
  { value: 'proximity',  label: 'Nearest to campus' },
  { value: 'avg_rating', label: 'Highest rated' },
]

type Props = {
  amenities: string[]
}

type FilterState = {
  type: string
  priceMin: string
  priceMax: string
  proximity: string
  selectedAmenities: string[]
  availableOnly: boolean
  sort: string
}

function readFromParams(searchParams: ReturnType<typeof useSearchParams>): FilterState {
  return {
    type:               searchParams.get('type')      ?? '',
    priceMin:           searchParams.get('price_min') ?? '',
    priceMax:           searchParams.get('price_max') ?? '',
    proximity:          searchParams.get('proximity') ?? '',
    selectedAmenities:  searchParams.getAll('amenities'),
    availableOnly:      searchParams.get('available') === 'true',
    sort:               searchParams.get('sort')      ?? '',
  }
}

export default function HousingFilterPanel({ amenities }: Props) {
  const router = useRouter()
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

  function applyFilters() {
    const params = new URLSearchParams()
    // Preserve text search query
    const q = searchParams.get('q')
    if (q) params.set('q', q)

    if (filters.type)      params.set('type',      filters.type)
    if (filters.priceMin)  params.set('price_min', filters.priceMin)
    if (filters.priceMax)  params.set('price_max', filters.priceMax)
    if (filters.proximity) params.set('proximity', filters.proximity)
    if (filters.availableOnly) params.set('available', 'true')
    if (filters.sort)      params.set('sort',      filters.sort)
    for (const a of filters.selectedAmenities) params.append('amenities', a)

    router.push(`?${params.toString()}`)
  }

  function resetFilters() {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters =
    !!filters.type ||
    !!filters.priceMin ||
    !!filters.priceMax ||
    !!filters.proximity ||
    filters.selectedAmenities.length > 0 ||
    filters.availableOnly ||
    !!filters.sort

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Housing type */}
      <div className="space-y-1.5">
        <Label htmlFor="type-select" className="text-xs font-medium text-gray-700">
          Housing type
        </Label>
        <select
          id="type-select"
          value={filters.type}
          onChange={(e) => set('type', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {HOUSING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">Monthly price (₱)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => set('priceMin', e.target.value)}
            className="text-sm"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => set('priceMax', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Max proximity */}
      <div className="space-y-1.5">
        <Label htmlFor="proximity-input" className="text-xs font-medium text-gray-700">
          Max distance from campus (km)
        </Label>
        <Input
          id="proximity-input"
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 2.5"
          value={filters.proximity}
          onChange={(e) => set('proximity', e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Amenities</Label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {amenities.map((name) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.selectedAmenities.includes(name)}
                  onChange={() => toggleAmenity(name)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Available rooms only */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <div
          role="switch"
          aria-checked={filters.availableOnly}
          onClick={() => set('availableOnly', !filters.availableOnly)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            filters.availableOnly ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              filters.availableOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-sm text-gray-700">Available rooms only</span>
      </label>

      {/* Sort */}
      <div className="space-y-1.5">
        <Label htmlFor="sort-select" className="text-xs font-medium text-gray-700">
          Sort by
        </Label>
        <select
          id="sort-select"
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <Button onClick={applyFilters} className="w-full">
        Apply filters
      </Button>
    </div>
  )
}
