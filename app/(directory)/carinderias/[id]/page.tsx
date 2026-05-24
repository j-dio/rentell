import { notFound } from 'next/navigation'
import { getCarinderiaById } from '@/lib/queries/carinderia'
import ImageGallery from '@/components/ImageGallery'

export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function CarinderiaDetailPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const carinderia = await getCarinderiaById(id)
  if (!carinderia) notFound()

  const { name, address, description, avg_rating, images } = carinderia

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">{name}</h1>
          {avg_rating && (
            <span className="text-lg font-semibold text-yellow-600">★ {avg_rating}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{address}</p>
      </div>

      <ImageGallery images={images} />

      {description && (
        <div>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
        </div>
      )}
    </main>
  )
}
