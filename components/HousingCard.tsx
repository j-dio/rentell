import Link from 'next/link'
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

  const priceLabel =
    monthly_price_min && monthly_price_max
      ? `₱${Number(monthly_price_min).toLocaleString()} – ₱${Number(monthly_price_max).toLocaleString()}`
      : monthly_price_min
      ? `From ₱${Number(monthly_price_min).toLocaleString()}`
      : null

  const typeLabel = housing_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Link href={`/housing/${housing_id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">

        {/* Image */}
        <div className="relative h-52 bg-gray-100 shrink-0">
          {primary_image_url ? (
            <img
              src={primary_image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No photo
            </div>
          )}

          {/* Type badge */}
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {typeLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">

          {/* Name + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
              {name}
            </h3>
            {avg_rating && (
              <span className="flex items-center gap-0.5 text-sm font-semibold text-yellow-500 shrink-0">
                ★ <span className="text-gray-700">{Number(avg_rating).toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {address}
          </p>

          <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
            {/* Price */}
            {priceLabel ? (
              <p className="text-sm font-bold text-gray-900">
                {priceLabel}
                <span className="text-xs font-normal text-gray-400"> /mo</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Price not listed</p>
            )}

            {/* Distance */}
            {proximity_to_campus_km && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                {Number(proximity_to_campus_km).toFixed(1)} km
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
