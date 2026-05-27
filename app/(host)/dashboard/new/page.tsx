export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'
import NewListingClient from '@/components/host/NewListingClient'

export default async function NewListingPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.isHost) redirect('/profile')

  const amenityRows = await sql<{ name: string }[]>`SELECT name FROM amenity ORDER BY name`
  const allAmenities = amenityRows.map((r) => r.name)

  return <NewListingClient allAmenities={allAmenities} />
}
