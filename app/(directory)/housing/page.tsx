import { getAllHousing } from '@/lib/queries/housing'
import HousingCard from '@/components/HousingCard'

export const dynamic = 'force-dynamic'

export default async function HousingPage() {
  const listings = await getAllHousing()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Housing Listings</h1>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No housing listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((housing) => (
            <HousingCard key={housing.housing_id} housing={housing} />
          ))}
        </div>
      )}
    </main>
  )
}
