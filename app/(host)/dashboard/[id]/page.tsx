export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getHousingById } from '@/lib/queries/housing'
import sql from '@/lib/db'
import RoomForm from '@/components/host/RoomForm'
import ImageURLForm from '@/components/host/ImageURLForm'
import VisitingHoursForm from '@/components/host/VisitingHoursForm'
import NearbyAttachForm from '@/components/host/NearbyAttachForm'
import HousingDetailsForm from '@/components/host/HousingDetailsForm'
import AmenityTagForm from '@/components/host/AmenityTagForm'

type VisitingHour = { id: number; day_of_week: number; start_time: string; end_time: string }
type Carinderia   = { carinderia_id: number; name: string; address: string }
type Essential    = { essential_id: number; name: string; type: string; address: string }
type Amenity      = { name: string }

type Params = { params: Promise<{ id: string }> }

export default async function ManageListingPage({ params }: Params) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.isHost) redirect('/profile')

  const { id } = await params
  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) notFound()

  const housing = await getHousingById(housingId)
  if (!housing) notFound()
  if (housing.owner_id !== session.userId) redirect('/dashboard')

  const [visitingHours, allCarinderias, allEssentials, allAmenities] = await Promise.all([
    sql<VisitingHour[]>`
      SELECT id, day_of_week, start_time::text, end_time::text
      FROM housing_visiting_hours
      WHERE housing_id = ${housingId}
      ORDER BY day_of_week, start_time
    `,
    sql<Carinderia[]>`SELECT carinderia_id, name, address FROM carinderia ORDER BY name`,
    sql<Essential[]>`SELECT essential_id, name, type, address FROM essential ORDER BY name`,
    sql<Amenity[]>`SELECT name FROM amenity ORDER BY name`,
  ])

  const linkedCarinderiaIds = new Set(housing.nearby_carinderias.map((c) => c.carinderia_id))
  const linkedEssentialIds  = new Set(housing.nearby_essentials.map((e) => e.essential_id))

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground">
            ← My Listings
          </Link>
          <h1 className="text-2xl font-bold mt-2">{housing.name}</h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">
            {housing.housing_type.replace('_', ' ')} · {housing.address}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href={`/housing/${housingId}`}
            className="text-sm text-primary hover:underline"
            target="_blank"
          >
            View public page ↗
          </Link>
          <Link
            href={`/dashboard/${housingId}/visits`}
            className="text-sm text-primary hover:underline"
          >
            Manage visits →
          </Link>
        </div>
      </div>

      {/* Basic Details */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
        <HousingDetailsForm
          housingId={housingId}
          initialName={housing.name}
          initialType={housing.housing_type}
          initialLocation={
            housing.latitude && housing.longitude
              ? { name: housing.address, lat: Number(housing.latitude), lng: Number(housing.longitude) }
              : null
          }
          initialPriceMin={housing.monthly_price_min}
          initialPriceMax={housing.monthly_price_max}
          initialContactPerson={housing.contact_person}
          initialContactNumber={housing.contact_number}
          initialDescription={housing.description}
        />
      </section>

      {/* Rooms */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Rooms</h2>
        <RoomForm housingId={housingId} rooms={housing.rooms} />
      </section>

      {/* Images */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <ImageURLForm housingId={housingId} images={housing.images} />
      </section>

      {/* Visiting Hours */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Visiting Hours</h2>
        <VisitingHoursForm housingId={housingId} visitingHours={visitingHours} />
      </section>

      {/* Nearby Places */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Nearby Places</h2>
        <NearbyAttachForm
          housingId={housingId}
          allCarinderias={allCarinderias}
          allEssentials={allEssentials}
          linkedCarinderiaIds={Array.from(linkedCarinderiaIds)}
          linkedEssentialIds={Array.from(linkedEssentialIds)}
        />
      </section>

      {/* Amenities */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Amenities</h2>
        <AmenityTagForm
          housingId={housingId}
          allAmenities={allAmenities.map((a) => a.name)}
          taggedAmenities={housing.amenities}
        />
      </section>
    </main>
  )
}
