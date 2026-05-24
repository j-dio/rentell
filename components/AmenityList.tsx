type Props = { amenities: string[] }

export default function AmenityList({ amenities }: Props) {
  if (amenities.length === 0) {
    return <p className="text-sm text-muted-foreground">No amenities listed.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((name) => (
        <span
          key={name}
          className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
        >
          {name}
        </span>
      ))}
    </div>
  )
}
