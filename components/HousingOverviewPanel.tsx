'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { HousingListItem } from '@/lib/queries/housing'
import FavoriteButton from '@/components/FavoriteButton'
import RatingStars from '@/components/RatingStars'

type Props = {
  housing: HousingListItem | null
  onClose: () => void
  isFavorited: boolean
  isLoggedIn: boolean
}

export default function HousingOverviewPanel({ housing, onClose, isFavorited, isLoggedIn }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!housing) return null

  const priceLabel =
    housing.monthly_price_min && housing.monthly_price_max
      ? `₱${Number(housing.monthly_price_min).toLocaleString()} – ₱${Number(housing.monthly_price_max).toLocaleString()}`
      : housing.monthly_price_min
      ? `From ₱${Number(housing.monthly_price_min).toLocaleString()}`
      : null

  const typeLabel = housing.housing_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div
      className="h-full bg-background flex flex-col"
      role="dialog"
      aria-label={`Overview: ${housing.name}`}
    >
      {/* Hero image */}
      <div className="relative shrink-0 h-52 bg-muted">
        {housing.primary_image_url ? (
          <img
            src={housing.primary_image_url}
            alt={housing.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No photo
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/15 pointer-events-none" />

        {/* Type badge */}
        <span className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {typeLabel}
        </span>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 active:scale-90 transition-all backdrop-blur-sm"
          aria-label="Close overview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Favorite button */}
        {isLoggedIn && (
          <div className="absolute bottom-3 right-4">
            <FavoriteButton
              listingType="housing"
              listingId={housing.housing_id}
              initialFavorited={isFavorited}
            />
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-5 pt-5 pb-8 flex flex-col gap-4">

          {/* Name + rating */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground leading-snug flex-1">
              {housing.name}
            </h2>
            <RatingStars rating={housing.avg_rating} />
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-muted-foreground leading-snug">{housing.address}</p>
          </div>

          {/* Price */}
          {priceLabel && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">{priceLabel}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
          )}

          {/* Distance pill */}
          {housing.proximity_to_campus_km && (
            <div>
              <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {Number(housing.proximity_to_campus_km).toFixed(1)} km from campus
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* CTA */}
          <Link
            href={`/housing/${housing.housing_id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] hover:opacity-90"
            style={{ backgroundColor: 'var(--cta)', color: 'var(--cta-foreground)' }}
          >
            View full details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            or{' '}
            <button onClick={onClose} className="underline underline-offset-2 hover:text-foreground transition-colors">
              continue browsing
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
