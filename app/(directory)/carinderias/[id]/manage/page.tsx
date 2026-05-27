export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getCarinderiaById } from '@/lib/queries/carinderia'
import CarinderiaEditForm from '@/components/CarinderiaEditForm'
import CarinderiaImageForm from '@/components/CarinderiaImageForm'
import DeleteCarinderiaButton from '@/components/DeleteCarinderiaButton'

type Props = { params: Promise<{ id: string }> }

export default async function ManageCarinderiaPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect(`/login`)

  const { id } = await params
  const carinderiaId = Number(id)
  if (isNaN(carinderiaId)) notFound()

  const carinderia = await getCarinderiaById(carinderiaId)
  if (!carinderia) notFound()
  if (carinderia.added_by !== session.userId) redirect(`/carinderias/${carinderiaId}`)

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground">
            ← My Listings
          </Link>
          <h1 className="text-2xl font-bold mt-2">{carinderia.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{carinderia.address}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href={`/carinderias/${carinderiaId}`}
            className="text-sm text-primary hover:underline"
            target="_blank"
          >
            View public page ↗
          </Link>
          <DeleteCarinderiaButton
            carinderiaId={carinderiaId}
            carinderiaName={carinderia.name}
          />
        </div>
      </div>

      {/* Basic Details */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
        <CarinderiaEditForm
          carinderiaId={carinderiaId}
          initialName={carinderia.name}
          initialAddress={carinderia.address}
          initialDescription={carinderia.description}
        />
      </section>

      {/* Images */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <CarinderiaImageForm
          carinderiaId={carinderiaId}
          images={carinderia.images}
        />
      </section>
    </main>
  )
}
