import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getFavoritesByUser } from '@/lib/queries/favorites'
import { Card, CardContent } from '@/components/ui/card'

export default async function FavoritesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const favorites = await getFavoritesByUser(session.userId)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 mb-5 rounded-2xl bg-secondary flex items-center justify-center">
            <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-foreground">No saved listings yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Browse{' '}
            <Link href="/housing" className="text-primary hover:underline">Housing</Link>
            {' '}or{' '}
            <Link href="/carinderias" className="text-primary hover:underline">Carinderias</Link>
            {' '}and tap the heart to save them here.
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
              <li key={fav.favorite_id}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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

                    <Link href={href} className="shrink-0 text-sm text-primary hover:underline">
                      View →
                    </Link>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
