import { notFound } from 'next/navigation'
import { getHousingById } from '@/lib/queries/housing'
import { getReviewsByHousing } from '@/lib/queries/reviews'
import { getVisitingHoursByHousing } from '@/lib/queries/visits'
import { getSession } from '@/lib/session'
import ImageGallery from '@/components/ImageGallery'
import RoomList from '@/components/RoomList'
import AmenityList from '@/components/AmenityList'
import NearbyList from '@/components/NearbyList'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'
import VisitRequestForm from '@/components/VisitRequestForm'
import MessageHostButton from '@/components/MessageHostButton'

export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function HousingDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const [housing, reviews, visitingHours, session] = await Promise.all([
    getHousingById(id),
    getReviewsByHousing(id),
    getVisitingHoursByHousing(id),
    getSession(),
  ])
  if (!housing) notFound()

  const {
    name,
    housing_type,
    address,
    contact_person,
    contact_number,
    monthly_price_min,
    monthly_price_max,
    description,
    avg_rating,
    rooms,
    amenities,
    images,
    nearby_carinderias,
    nearby_essentials,
  } = housing

  const priceRange =
    monthly_price_min && monthly_price_max
      ? `₱${Number(monthly_price_min).toLocaleString()} – ₱${Number(monthly_price_max).toLocaleString()}`
      : monthly_price_min
      ? `From ₱${Number(monthly_price_min).toLocaleString()}`
      : 'Price not listed'

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {housing_type.replace('_', ' ')}
            </p>
          </div>
          {avg_rating && (
            <span className="text-lg font-semibold text-yellow-600">★ {avg_rating}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{address}</p>
      </div>

      <ImageGallery images={images} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Price Range</p>
          <p className="font-semibold">{priceRange} / month</p>
        </div>
        {contact_person && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
            <p className="font-semibold">{contact_person}</p>
          </div>
        )}
        {contact_number && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
            <p className="font-semibold">{contact_number}</p>
          </div>
        )}
      </div>

      {description && (
        <div>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Amenities</h2>
        <AmenityList amenities={amenities} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Rooms</h2>
        <RoomList rooms={rooms} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Nearby Carinderias</h2>
        <NearbyList type="carinderia" items={nearby_carinderias} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Nearby Essentials</h2>
        <NearbyList type="essential" items={nearby_essentials} />
      </div>

      {session && session.userId !== housing.owner_id && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Host</h2>
          <MessageHostButton hostId={housing.owner_id} housingId={id} />
        </div>
      )}

      {session && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Book a Visit</h2>
          <VisitRequestForm housingId={id} visitingHours={visitingHours} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Reviews</h2>
        <div className="space-y-4">
          {session && (
            <ReviewForm listingType="housing" listingId={id} />
          )}
          <ReviewList reviews={reviews} currentUserId={session?.userId} />
        </div>
      </div>
    </main>
  )
}
