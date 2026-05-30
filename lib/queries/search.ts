import sql from '@/lib/db'
import type { HousingListItem } from './housing'
import type { CarinderiaListItem } from './carinderia'

export type HousingSearchParams = {
  query?: string
  housingType?: string
  priceMin?: number
  priceMax?: number
  amenities?: string[]
  availableOnly?: boolean
  sortBy?: 'avg_rating'
}

export type CarinderiaSearchParams = {
  query?: string
}

export async function searchHousing(
  params: HousingSearchParams
): Promise<HousingListItem[]> {
  const q = params.query?.trim() ? `%${params.query.trim()}%` : null
  const amenities = params.amenities?.length ? params.amenities : null
  const amenityCount = amenities?.length ?? 0

  const orderByClause =
    params.sortBy === 'avg_rating'
      ? sql`ORDER BY avg_rating DESC NULLS LAST`
      : sql`ORDER BY h.created_at DESC`

  return sql<HousingListItem[]>`
    SELECT
      h.housing_id,
      h.name,
      h.housing_type,
      h.address,
      h.monthly_price_min,
      h.monthly_price_max,
      (
        SELECT url
        FROM housing_image
        WHERE housing_id = h.housing_id
        ORDER BY is_primary DESC, sort_order ASC
        LIMIT 1
      ) AS primary_image_url,
      (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM review
        WHERE housing_id = h.housing_id
          AND listing_type = 'housing'
      ) AS avg_rating
    FROM housing h
    WHERE 1=1
      ${q ? sql`AND (
        h.name        ILIKE ${q} OR
        h.address     ILIKE ${q} OR
        h.description ILIKE ${q}
      )` : sql``}
      ${params.housingType ? sql`AND h.housing_type = ${params.housingType}` : sql``}
      ${params.priceMin != null ? sql`AND h.monthly_price_min >= ${params.priceMin}` : sql``}
      ${params.priceMax != null ? sql`AND h.monthly_price_min <= ${params.priceMax}` : sql``}
      ${amenities ? sql`AND h.housing_id IN (
        SELECT housing_id
        FROM housing_amenity
        WHERE amenity_name = ANY(${amenities})
        GROUP BY housing_id
        HAVING COUNT(DISTINCT amenity_name) = ${amenityCount}
      )` : sql``}
      ${params.availableOnly ? sql`AND EXISTS (
        SELECT 1
        FROM room r
        WHERE r.housing_id = h.housing_id
          AND r.available_slots > 0
      )` : sql``}
    ${orderByClause}
  `
}

export async function searchCarinderias(
  params: CarinderiaSearchParams
): Promise<CarinderiaListItem[]> {
  const q = params.query?.trim() ? `%${params.query.trim()}%` : null

  return sql<CarinderiaListItem[]>`
    SELECT
      c.carinderia_id,
      c.name,
      c.address,
      (
        SELECT url
        FROM carinderia_image
        WHERE carinderia_id = c.carinderia_id
        ORDER BY is_primary DESC
        LIMIT 1
      ) AS primary_image_url,
      (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM review
        WHERE carinderia_id = c.carinderia_id
          AND listing_type = 'carinderia'
      ) AS avg_rating
    FROM carinderia c
    WHERE 1=1
      ${q ? sql`AND (
        c.name        ILIKE ${q} OR
        c.address     ILIKE ${q} OR
        c.description ILIKE ${q}
      )` : sql``}
    ORDER BY c.created_at DESC
  `
}
