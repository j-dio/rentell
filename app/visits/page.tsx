import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getVisitsByUser } from '@/lib/queries/visits'
import CancelVisitButton from '@/components/CancelVisitButton'

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
        <div className="text-center py-20 border rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">No visit requests yet</p>
          <p className="text-sm mt-1">
            Find a listing on the{' '}
            <Link href="/housing" className="text-primary hover:underline">
              Housing
            </Link>{' '}
            page and request a visit.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visits.map((visit) => (
            <li key={visit.visit_id} className="border rounded-lg p-4 space-y-2">
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
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
