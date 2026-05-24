import { getAllCarinderias } from '@/lib/queries/carinderia'
import CarinderiaCard from '@/components/CarinderiaCard'

export const dynamic = 'force-dynamic'

export default async function CarinderiasPage() {
  const listings = await getAllCarinderias()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carinderias</h1>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No carinderias listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((carinderia) => (
            <CarinderiaCard key={carinderia.carinderia_id} carinderia={carinderia} />
          ))}
        </div>
      )}
    </main>
  )
}
