import sql from '@/lib/db'
import { searchHousing } from '@/lib/queries/search'
import { getFavoritesByUser } from '@/lib/queries/favorites'
import { getSession } from '@/lib/session'
import HousingPageShell from '@/components/HousingPageShell'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HousingPage({ searchParams }: PageProps) {
  const raw = searchParams

  const query        = typeof raw.q         === 'string' ? raw.q         : undefined
  const housingType  = typeof raw.type      === 'string' ? raw.type      : undefined
  const sortParam    = typeof raw.sort      === 'string' ? raw.sort      : undefined
  const sortBy       = sortParam === 'proximity' || sortParam === 'avg_rating'
                         ? sortParam : undefined

  const priceMin     = typeof raw.price_min  === 'string' ? (Number(raw.price_min)  || undefined) : undefined
  const priceMax     = typeof raw.price_max  === 'string' ? (Number(raw.price_max)  || undefined) : undefined
  const maxProximity = typeof raw.proximity  === 'string' ? (Number(raw.proximity)  || undefined) : undefined

  const amenities    = typeof raw.amenities === 'string'
                         ? [raw.amenities]
                         : Array.isArray(raw.amenities)
                         ? raw.amenities
                         : undefined

  const availableOnly = raw.available === 'true'

  const [listings, amenityRows] = await Promise.all([
    searchHousing({ query, housingType, priceMin, priceMax, maxProximity, amenities, availableOnly, sortBy }),
    sql<{ name: string }[]>`SELECT name FROM amenity ORDER BY name ASC`,
  ])

  const allAmenities = amenityRows.map((r) => r.name)

  let session = null
  try {
    session = await getSession()
  } catch {
    // DB cold-start timeout — treat as logged out
  }

  const favoritedIds: number[] = []
  if (session) {
    const favs = await getFavoritesByUser(session.userId)
    for (const f of favs) {
      if (f.listing_type === 'housing' && f.housing_id) favoritedIds.push(f.housing_id)
    }
  }

  const hasFilters = !!(
    query || housingType || priceMin || priceMax || maxProximity ||
    amenities?.length || availableOnly || sortBy
  )

  return (
    <HousingPageShell
      listings={listings}
      favoritedIds={favoritedIds}
      isLoggedIn={!!session}
      allAmenities={allAmenities}
      hasFilters={hasFilters}
    />
  )
}
