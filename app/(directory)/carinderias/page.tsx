import { Suspense } from 'react'
import { searchCarinderias } from '@/lib/queries/search'
import { getFavoritesByUser } from '@/lib/queries/favorites'
import { getSession } from '@/lib/session'
import CarinderiaCard from '@/components/CarinderiaCard'
import FavoriteButton from '@/components/FavoriteButton'
import SearchBar from '@/components/SearchBar'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CarinderiasPage({ searchParams }: PageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined

  const [listingsResult, sessionResult] = await Promise.allSettled([
    searchCarinderias({ query }),
    getSession(),
  ])

  const listings = listingsResult.status === 'fulfilled' ? listingsResult.value : []
  const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null

  const favoritedIds = new Set<number>()
  if (session) {
    const favs = await getFavoritesByUser(session.userId)
    for (const f of favs) {
      if (f.listing_type === 'carinderia' && f.carinderia_id) favoritedIds.add(f.carinderia_id)
    }
  }

  const hasFilters = !!query

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Carinderias</h1>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-[4.75rem] w-full animate-pulse rounded-2xl bg-muted" />}>
          <SearchBar placeholder="Search by name or address…" />
        </Suspense>
      </div>

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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-base font-semibold text-gray-700">
            {hasFilters ? 'No carinderias match your search.' : 'No carinderias listed yet.'}
          </p>
          {hasFilters && (
            <p className="mt-1 text-sm text-gray-500">
              Try a different keyword or clear the search.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((carinderia) => (
            <div key={carinderia.carinderia_id} className="relative">
              <CarinderiaCard carinderia={carinderia} />
              {session && (
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton
                    listingType="carinderia"
                    listingId={carinderia.carinderia_id}
                    initialFavorited={favoritedIds.has(carinderia.carinderia_id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
