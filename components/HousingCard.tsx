import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { HousingListItem } from '@/lib/queries/housing'

type Props = { housing: HousingListItem }

export default function HousingCard({ housing }: Props) {
  const {
    housing_id,
    name,
    housing_type,
    address,
    monthly_price_min,
    monthly_price_max,
    proximity_to_campus_km,
    primary_image_url,
    avg_rating,
  } = housing

  const priceRange =
    monthly_price_min && monthly_price_max
      ? `₱${Number(monthly_price_min).toLocaleString()} – ₱${Number(monthly_price_max).toLocaleString()}`
      : monthly_price_min
      ? `From ₱${Number(monthly_price_min).toLocaleString()}`
      : 'Price not listed'

  return (
    <Link href={`/housing/${housing_id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="h-48 bg-muted relative">
          {primary_image_url ? (
            <img
              src={primary_image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No photo
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">{name}</h3>
            {avg_rating && (
              <span className="text-sm font-medium text-yellow-600 shrink-0">
                ★ {avg_rating}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {housing_type.replace('_', ' ')}
          </p>
          <p className="text-sm font-medium">{priceRange}</p>
          {proximity_to_campus_km && (
            <p className="text-xs text-muted-foreground">
              {Number(proximity_to_campus_km).toFixed(1)} km from campus
            </p>
          )}
          <p className="text-xs text-muted-foreground line-clamp-1">{address}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
