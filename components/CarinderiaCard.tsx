import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { CarinderiaListItem } from '@/lib/queries/carinderia'

type Props = { carinderia: CarinderiaListItem }

export default function CarinderiaCard({ carinderia }: Props) {
  const { carinderia_id, name, address, primary_image_url, avg_rating } = carinderia

  return (
    <Link href={`/carinderias/${carinderia_id}`}>
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
          <p className="text-xs text-muted-foreground line-clamp-1">{address}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
