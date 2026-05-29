import Link from 'next/link'
import type { CarinderiaListItem } from '@/lib/queries/carinderia'
import RatingStars from '@/components/RatingStars'

type Props = { carinderia: CarinderiaListItem }

export default function CarinderiaCard({ carinderia }: Props) {
  const { carinderia_id, name, address, primary_image_url, avg_rating } = carinderia

  return (
    <Link href={`/carinderias/${carinderia_id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col active:scale-[0.99] cursor-pointer">
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
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Carinderia
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2 flex-1">
              {name}
            </h3>
            <RatingStars rating={avg_rating} />
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {address}
          </p>
        </div>
      </div>
    </Link>
  )
}
