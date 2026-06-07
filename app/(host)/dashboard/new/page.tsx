export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { redirectToSignUp } from '@/lib/auth-redirect'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'
import NewListingClient from '@/components/host/NewListingClient'

export default async function NewListingPage() {
  const session = await getSession()
  if (!session) redirectToSignUp('/dashboard/new')
  if (!session.isHost) redirect('/profile')

  const amenityRows = await sql<{ name: string }[]>`SELECT name FROM amenity ORDER BY name`
  const allAmenities = amenityRows.map((r) => r.name)

  return <NewListingClient allAmenities={allAmenities} />
}
