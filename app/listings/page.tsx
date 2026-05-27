import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/session'
import { getOwnHousing } from '@/lib/queries/host'
import { getOwnCarinderias } from '@/lib/queries/carinderia'
import DeleteListingButton from '@/components/DeleteListingButton'
import DeleteCarinderiaButton from '@/components/DeleteCarinderiaButton'

export const dynamic = 'force-dynamic'

export default async function ListingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [carinderias, housingListings] = await Promise.all([
    getOwnCarinderias(session.userId),
    session.isHost ? getOwnHousing(session.userId) : Promise.resolve([]),
  ])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      <div>
        <h1 className="text-2xl font-bold">My Listings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage everything you've listed on RenTell.
        </p>
      </div>

      {/* ── Housing Listings (hosts only) ──────────────────────────────────── */}
      {session.isHost && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Housing Listings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dormitories, boarding houses, apartments
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              + New Housing
            </Link>
          </div>

          {housingListings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg text-muted-foreground bg-muted/20">
              <p className="font-medium">No housing listings yet</p>
              <p className="text-sm mt-1">Create your first housing listing to get started.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {housingListings.map((l) => (
                <li key={l.housing_id} className="border rounded-lg p-4 flex items-center gap-4 bg-card">
                  {l.primary_image_url ? (
                    <Image
                      src={l.primary_image_url as string}
                      alt={l.name as string}
                      width={72}
                      height={72}
                      unoptimized
                      className="w-[72px] h-[72px] object-cover rounded-md shrink-0"
                    />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-md bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{l.name as string}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {(l.housing_type as string).replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{l.address as string}</p>
                    {(l.monthly_price_min || l.monthly_price_max) && (
                      <p className="text-xs mt-0.5 text-foreground/80">
                        ₱{l.monthly_price_min as string}
                        {l.monthly_price_max ? ` – ₱${l.monthly_price_max as string}` : ''} / mo
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <DeleteListingButton
                      housingId={l.housing_id as number}
                      listingName={l.name as string}
                    />
                    <Link
                      href={`/dashboard/${l.housing_id}`}
                      className="text-sm text-primary hover:underline whitespace-nowrap"
                    >
                      Manage →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── Carinderia Listings ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Carinderia Listings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Food stalls and canteens you've added
            </p>
          </div>
          <Link
            href="/carinderias/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            + New Carinderia
          </Link>
        </div>

        {carinderias.length === 0 ? (
          <div className="text-center py-12 border rounded-lg text-muted-foreground bg-muted/20">
            <p className="font-medium">No carinderia listings yet</p>
            <p className="text-sm mt-1">
              Know a great carinderia near campus?{' '}
              <Link href="/carinderias/new" className="text-primary hover:underline">
                Add one now.
              </Link>
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {carinderias.map((c) => (
              <li key={c.carinderia_id} className="border rounded-lg p-4 flex items-center gap-4 bg-card">
                {c.primary_image_url ? (
                  <Image
                    src={c.primary_image_url}
                    alt={c.name}
                    width={72}
                    height={72}
                    unoptimized
                    className="w-[72px] h-[72px] object-cover rounded-md shrink-0"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-md bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.address}</p>
                  {c.avg_rating && (
                    <p className="text-xs text-yellow-600 mt-0.5">★ {c.avg_rating}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <DeleteCarinderiaButton
                    carinderiaId={c.carinderia_id}
                    carinderiaName={c.name}
                  />
                  <Link
                    href={`/carinderias/${c.carinderia_id}/manage`}
                    className="text-sm text-primary hover:underline whitespace-nowrap"
                  >
                    Manage →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
