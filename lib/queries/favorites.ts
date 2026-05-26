import sql from '@/lib/db'

export type FavoriteItem = {
  favorite_id: number
  listing_type: 'housing' | 'carinderia'
  housing_id: number | null
  carinderia_id: number | null
  name: string
  address: string
  created_at: Date
}

export async function getFavoritesByUser(userId: number): Promise<FavoriteItem[]> {
  return sql<FavoriteItem[]>`
    SELECT
      f.favorite_id,
      f.listing_type,
      f.housing_id,
      f.carinderia_id,
      COALESCE(h.name, c.name)        AS name,
      COALESCE(h.address, c.address)  AS address,
      f.created_at
    FROM favorite f
    LEFT JOIN housing    h ON h.housing_id    = f.housing_id
    LEFT JOIN carinderia c ON c.carinderia_id = f.carinderia_id
    WHERE f.user_id = ${userId}
    ORDER BY f.created_at DESC
  `
}

export async function addFavorite(
  userId: number,
  listingType: 'housing' | 'carinderia',
  listingId: number,
) {
  const housingId     = listingType === 'housing'    ? listingId : null
  const carinderia_id = listingType === 'carinderia' ? listingId : null

  const rows = await sql<{ favorite_id: number }[]>`
    INSERT INTO favorite (user_id, listing_type, housing_id, carinderia_id)
    VALUES (${userId}, ${listingType}, ${housingId}, ${carinderia_id})
    RETURNING favorite_id
  `
  return rows[0]
}

export async function removeFavorite(
  userId: number,
  listingType: 'housing' | 'carinderia',
  listingId: number,
) {
  const housingId     = listingType === 'housing'    ? listingId : null
  const carinderia_id = listingType === 'carinderia' ? listingId : null

  const rows = await sql<{ favorite_id: number }[]>`
    DELETE FROM favorite
    WHERE user_id        = ${userId}
      AND listing_type   = ${listingType}
      AND housing_id     IS NOT DISTINCT FROM ${housingId}
      AND carinderia_id  IS NOT DISTINCT FROM ${carinderia_id}
    RETURNING favorite_id
  `
  return rows[0] as { favorite_id: number } | undefined
}

export async function isFavorited(
  userId: number,
  listingType: 'housing' | 'carinderia',
  listingId: number,
): Promise<boolean> {
  const housingId     = listingType === 'housing'    ? listingId : null
  const carinderia_id = listingType === 'carinderia' ? listingId : null

  const rows = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM favorite
      WHERE user_id        = ${userId}
        AND listing_type   = ${listingType}
        AND housing_id     IS NOT DISTINCT FROM ${housingId}
        AND carinderia_id  IS NOT DISTINCT FROM ${carinderia_id}
    ) AS exists
  `
  return rows[0].exists
}
