import type { NearbyCarinderia, NearbyEssential } from '@/lib/queries/housing'

type CarinderiaProps = {
  type: 'carinderia'
  items: NearbyCarinderia[]
}

type EssentialProps = {
  type: 'essential'
  items: NearbyEssential[]
}

type Props = CarinderiaProps | EssentialProps

export default function NearbyList(props: Props) {
  const { type, items } = props

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No nearby {type === 'carinderia' ? 'carinderias' : 'essentials'} listed.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {type === 'carinderia'
        ? (items as NearbyCarinderia[]).map((item) => (
            <li key={item.carinderia_id} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.address}</p>
              </div>
              {item.distance_km && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {Number(item.distance_km).toFixed(2)} km
                </span>
              )}
            </li>
          ))
        : (items as NearbyEssential[]).map((item) => (
            <li key={item.essential_id} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">
                  {item.name}
                  <span className="ml-2 text-xs text-muted-foreground capitalize">
                    {item.type.replace('-', ' ')}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{item.address}</p>
              </div>
              {item.distance_km && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {Number(item.distance_km).toFixed(2)} km
                </span>
              )}
            </li>
          ))}
    </ul>
  )
}
