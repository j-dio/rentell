import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/session'
import { getOwnHousing } from '@/lib/queries/host'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.isHost) redirect('/profile')

  const listings = await getOwnHousing(session.userId)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your housing listings
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 border rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm mt-1">Create your first housing listing to get started.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => (
            <li key={l.housing_id} className="border rounded-lg p-4 flex items-center gap-4">
              {l.primary_image_url ? (
                <Image
                  src={l.primary_image_url as string}
                  alt={l.name as string}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-20 h-20 object-cover rounded-md shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-md bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{l.name as string}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {(l.housing_type as string).replace('_', ' ')}
                </p>
                <p className="text-sm text-muted-foreground truncate">{l.address as string}</p>
                {(l.monthly_price_min || l.monthly_price_max) && (
                  <p className="text-sm mt-0.5">
                    ₱{l.monthly_price_min as string}
                    {l.monthly_price_max ? ` – ₱${l.monthly_price_max as string}` : ''} / mo
                  </p>
                )}
              </div>

              <Link
                href={`/dashboard/${l.housing_id}`}
                className="shrink-0 text-sm text-primary hover:underline"
              >
                Manage →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
