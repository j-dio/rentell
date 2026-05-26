import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getFavoritesByUser } from '@/lib/queries/favorites'

export default async function FavoritesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const favorites = await getFavoritesByUser(session.userId)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 border rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">No saved listings yet</p>
          <p className="text-sm mt-1">
            Browse{' '}
            <Link href="/housing" className="text-primary hover:underline">
              Housing
            </Link>{' '}
            or{' '}
            <Link href="/carinderias" className="text-primary hover:underline">
              Carinderias
            </Link>{' '}
            and tap the heart to save them here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {favorites.map((fav) => {
            const href =
              fav.listing_type === 'housing'
                ? `/housing/${fav.housing_id}`
                : `/carinderias/${fav.carinderia_id}`

            return (
              <li key={fav.favorite_id} className="border rounded-lg p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        fav.listing_type === 'housing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {fav.listing_type === 'housing' ? 'Housing' : 'Carinderia'}
                    </span>
                  </div>
                  <p className="font-semibold truncate">{fav.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{fav.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={href}
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  View →
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
