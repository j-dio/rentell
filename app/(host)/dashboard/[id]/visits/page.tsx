export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { redirectToSignUp } from '@/lib/auth-redirect'
import { getSession } from '@/lib/session'
import { getHousingById } from '@/lib/queries/housing'
import { getVisitsByHousing } from '@/lib/queries/visits'
import VisitStatusButton from '@/components/VisitStatusButton'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  declined:  'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

type Params = { params: Promise<{ id: string }> }

export default async function OwnerVisitsPage({ params }: Params) {
  const { id } = await params

  const session = await getSession()
  if (!session) redirectToSignUp(`/dashboard/${id}/visits`)
  if (!session.isHost) redirect('/profile')

  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) notFound()

  const housing = await getHousingById(housingId)
  if (!housing) notFound()
  if (housing.owner_id !== session.userId) redirect('/listings')

  const visits = await getVisitsByHousing(housingId)

  const pending   = visits.filter((v) => v.status === 'pending')
  const confirmed = visits.filter((v) => v.status === 'confirmed')
  const others    = visits.filter((v) => v.status === 'declined' || v.status === 'cancelled')

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${housingId}`} className="text-sm text-muted-foreground hover:underline">
          ← Back to listing
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Visits — {housing.name}</h1>

      {visits.length === 0 && (
        <div className="text-center py-16 border rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">No visit requests yet</p>
          <p className="text-sm mt-1">Requests from students will appear here.</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Pending ({pending.length})</h2>
          <ul className="space-y-3">
            {pending.map((visit) => (
              <li key={visit.visit_id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{visit.visitor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.scheduled_at).toLocaleString()}
                    </p>
                    {visit.note && (
                      <p className="text-sm mt-1 italic text-muted-foreground">{visit.note}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status]}`}>
                    {visit.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <VisitStatusButton visitId={visit.visit_id} status="confirmed" label="Confirm" />
                  <VisitStatusButton visitId={visit.visit_id} status="declined" label="Decline" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {confirmed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Confirmed ({confirmed.length})</h2>
          <ul className="space-y-3">
            {confirmed.map((visit) => (
              <li key={visit.visit_id} className="border rounded-lg p-4 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{visit.visitor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.scheduled_at).toLocaleString()}
                    </p>
                    {visit.note && (
                      <p className="text-sm mt-1 italic text-muted-foreground">{visit.note}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status]}`}>
                    {visit.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-muted-foreground">Declined / Cancelled ({others.length})</h2>
          <ul className="space-y-3">
            {others.map((visit) => (
              <li key={visit.visit_id} className="border rounded-lg p-4 opacity-60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{visit.visitor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status]}`}>
                    {visit.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
