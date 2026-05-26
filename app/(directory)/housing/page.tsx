import { getAllHousing } from '@/lib/queries/housing'
import { getFavoritesByUser } from '@/lib/queries/favorites'
import { getSession } from '@/lib/session'
import HousingCard from '@/components/HousingCard'
import FavoriteButton from '@/components/FavoriteButton'

export const dynamic = 'force-dynamic'

export default async function HousingPage() {
  const [listings, session] = await Promise.all([getAllHousing(), getSession()])

  const favoritedIds = new Set<number>()
  if (session) {
    const favs = await getFavoritesByUser(session.userId)
    for (const f of favs) {
      if (f.listing_type === 'housing' && f.housing_id) favoritedIds.add(f.housing_id)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Housing Listings</h1>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No housing listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </main>
  )
}
