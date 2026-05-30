'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'
import type { HousingListItem } from '@/lib/queries/housing'
import RatingStars from '@/components/RatingStars'

type Props = {
  housing: HousingListItem
  onSelect?: (h: HousingListItem) => void
  isSelected?: boolean
}

export default function HousingCard({ housing, onSelect, isSelected }: Props) {
  const {
    housing_id,
    name,
    housing_type,
    address,
    monthly_price_min,
    monthly_price_max,
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

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!onSelect) return
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    onSelect(housing)
  }

  return (
    <Link href={`/housing/${housing_id}`} className="group block" onClick={handleClick}>
      <div
        className={`rounded-2xl overflow-hidden bg-card border transition-all duration-200 h-full flex flex-col active:scale-[0.99] cursor-pointer ${
          isSelected
            ? 'border-primary shadow-lg ring-2 ring-primary/20'
            : 'border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5'
        }`}
      >
        {/* Image */}
        <div className="relative h-52 bg-muted shrink-0">
          {primary_image_url ? (
            <img
              src={primary_image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No photo
            </div>
          )}

          {/* Type badge */}
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {typeLabel}
          </span>

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">

          {/* Name + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2 flex-1">
              {name}
            </h3>
            <RatingStars rating={avg_rating} />
          </div>

          {/* Address */}
          <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {address}
          </p>

          <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
            {/* Price */}
            {priceLabel ? (
              <p className="text-sm font-bold text-foreground">
                {priceLabel}
                <span className="text-xs font-normal text-muted-foreground"> /mo</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Price not listed</p>
            )}

          </div>
        </div>
      </div>
    </Link>
  )
}
