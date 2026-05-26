import { Suspense } from 'react'
import sql from '@/lib/db'
import { searchHousing } from '@/lib/queries/search'
import { getFavoritesByUser } from '@/lib/queries/favorites'
import { getSession } from '@/lib/session'
import HousingCard from '@/components/HousingCard'
import FavoriteButton from '@/components/FavoriteButton'
import SearchBar from '@/components/SearchBar'
import HousingFilterPanel from '@/components/HousingFilterPanel'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HousingPage({ searchParams }: PageProps) {
  const raw = searchParams

  const query       = typeof raw.q         === 'string' ? raw.q         : undefined
  const housingType = typeof raw.type      === 'string' ? raw.type      : undefined
  const sortParam   = typeof raw.sort      === 'string' ? raw.sort      : undefined
  const sortBy      = sortParam === 'proximity' || sortParam === 'avg_rating'
                        ? sortParam
                        : undefined

  const priceMin    = typeof raw.price_min === 'string' ? (Number(raw.price_min) || undefined) : undefined
  const priceMax    = typeof raw.price_max === 'string' ? (Number(raw.price_max) || undefined) : undefined
  const maxProximity = typeof raw.proximity === 'string' ? (Number(raw.proximity) || undefined) : undefined

  const amenities   = typeof raw.amenities === 'string'
                        ? [raw.amenities]
                        : Array.isArray(raw.amenities)
                        ? raw.amenities
                        : undefined

  const availableOnly = raw.available === 'true'

  const [listings, session, amenityRows] = await Promise.all([
    searchHousing({ query, housingType, priceMin, priceMax, maxProximity, amenities, availableOnly, sortBy }),
    getSession(),
    sql<{ name: string }[]>`SELECT name FROM amenity ORDER BY name ASC`,
  ])

  const allAmenities = amenityRows.map((r) => r.name)

  const favoritedIds = new Set<number>()
  if (session) {
    const favs = await getFavoritesByUser(session.userId)
    for (const f of favs) {
      if (f.listing_type === 'housing' && f.housing_id) favoritedIds.add(f.housing_id)
    }
  }

  const hasFilters = !!(
    query || housingType || priceMin || priceMax || maxProximity ||
    amenities?.length || availableOnly || sortBy
  )

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Housing Listings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-gray-100" />}>
            <SearchBar placeholder="Search by name, address…" />
          </Suspense>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
            <HousingFilterPanel amenities={allAmenities} />
          </Suspense>
        </aside>

        {/* Results */}
        <section className="flex-1 min-w-0">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg
                className="w-14 h-14 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <p className="text-base font-semibold text-gray-700">
                {hasFilters ? 'No housing matches your filters.' : 'No housing listings yet.'}
              </p>
              {hasFilters && (
                <p className="mt-1 text-sm text-gray-500">
                  Try broadening your search or clearing some filters.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((housing) => (
                <div key={housing.housing_id} className="relative">
                  <HousingCard housing={housing} />
                  {session && (
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton
                        listingType="housing"
                        listingId={housing.housing_id}
                        initialFavorited={favoritedIds.has(housing.housing_id)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
