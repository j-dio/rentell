type GalleryImage = {
  image_id: number
  url: string
  caption: string | null
}

type Props = { images: GalleryImage[] }

export default function ImageGallery({ images }: Props) {
  if (images.length === 0) {
    return (
      <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
        No photos available
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="rounded-lg overflow-hidden h-64">
        <img
          src={images[0].url}
          alt={images[0].caption ?? 'Listing photo'}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  const [primary, ...rest] = images

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 md:col-span-1 rounded-lg overflow-hidden h-64">
        <img
          src={primary.url}
          alt={primary.caption ?? 'Listing photo'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:col-span-1">
        {rest.slice(0, 4).map((img) => (
          <div key={img.image_id} className="rounded-lg overflow-hidden h-[7.75rem]">
            <img
              src={img.url}
              alt={img.caption ?? 'Listing photo'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
