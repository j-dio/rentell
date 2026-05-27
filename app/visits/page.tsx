import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getVisitsByUser } from '@/lib/queries/visits'
import CancelVisitButton from '@/components/CancelVisitButton'
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

  const visits = await getVisitsByUser(session.userId)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Visit Requests</h1>

      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 mb-5 rounded-2xl bg-secondary flex items-center justify-center">
            <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-foreground">No visit requests yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Find a listing on the{' '}
            <Link href="/housing" className="text-primary hover:underline">Housing</Link>
            {' '}page and request a visit.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visits.map((visit) => (
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

                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[visit.status] ?? ''}`}
                    >
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
    </main>
  )
}
