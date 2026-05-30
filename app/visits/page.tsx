import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getVisitsByUser, getIncomingVisitsByHost } from '@/lib/queries/visits'
import CancelVisitButton from '@/components/CancelVisitButton'
import VisitStatusButton from '@/components/VisitStatusButton'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  declined:  'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default async function VisitsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [myVisits, incomingVisits] = await Promise.all([
    getVisitsByUser(session.userId),
    session.isHost ? getIncomingVisitsByHost(session.userId) : Promise.resolve([]),
  ])

  const pendingIncoming = incomingVisits.filter((v) => v.status === 'pending')
  const otherIncoming   = incomingVisits.filter((v) => v.status !== 'pending')

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      <h1 className="text-2xl font-bold">Visits</h1>

      {/* ── Incoming requests (hosts only) ─────────────────────────────────── */}
      {session.isHost && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Incoming Requests</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visit requests submitted to your listings
            </p>
          </div>

          {incomingVisits.length === 0 ? (
            <div className="text-center py-10 border rounded-lg text-muted-foreground bg-muted/20">
              <p className="font-medium">No visit requests yet</p>
              <p className="text-sm mt-1">Requests from students will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingIncoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Pending ({pendingIncoming.length})
                  </h3>
                  <ul className="space-y-3">
                    {pendingIncoming.map((visit) => (
                      <li key={visit.visit_id}>
                        <Card>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium">{visit.visitor_name}</p>
                                <Link
                                  href={`/dashboard/${visit.housing_id}/visits`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {visit.housing_name} →
                                </Link>
                                <p className="text-sm text-muted-foreground mt-0.5">
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
                              <VisitStatusButton visitId={visit.visit_id} status="declined"  label="Decline"  />
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {otherIncoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Confirmed / Declined / Cancelled ({otherIncoming.length})
                  </h3>
                  <ul className="space-y-3">
                    {otherIncoming.map((visit) => (
                      <li key={visit.visit_id}>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium">{visit.visitor_name}</p>
                                <Link
                                  href={`/dashboard/${visit.housing_id}/visits`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {visit.housing_name} →
                                </Link>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {new Date(visit.scheduled_at).toLocaleString()}
                                </p>
                              </div>
                              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status]}`}>
                                {visit.status}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── My visit requests ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">My Visit Requests</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visits you have requested at other listings
          </p>
        </div>

        {myVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
            <div className="w-14 h-14 mb-4 rounded-2xl bg-secondary flex items-center justify-center">
              <svg className="w-7 h-7 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium">No visit requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Find a listing on the{' '}
              <Link href="/housing" className="text-primary hover:underline">Housing</Link>
              {' '}page and request a visit.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {myVisits.map((visit) => (
              <li key={visit.visit_id}>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/housing/${visit.housing_id}`}
                          className="font-semibold hover:underline text-primary"
                        >
                          View listing →
                        </Link>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(visit.scheduled_at).toLocaleString()}
                        </p>
                        {visit.note && (
                          <p className="text-sm mt-1 text-muted-foreground italic">{visit.note}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status] ?? ''}`}>
                        {visit.status}
                      </span>
                    </div>
                    {visit.status === 'pending' && (
                      <CancelVisitButton visitId={visit.visit_id} />
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
