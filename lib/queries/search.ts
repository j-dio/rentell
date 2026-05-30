import sql from '@/lib/db'
import type { HousingListItem } from './housing'
import type { CarinderiaListItem } from './carinderia'

export type HousingSearchParams = {
  query?: string
  housingType?: string
  priceMin?: number
  priceMax?: number
  maxDistance?: number
  amenities?: string[]
  availableOnly?: boolean
  sortBy?: 'proximity' | 'avg_rating'
  userLat?: number
  userLng?: number
}

export type CarinderiaSearchParams = {
  query?: string
}

export async function searchHousing(params: HousingSearchParams): Promise<HousingListItem[]> {
  const q = params.query?.trim() ? `%${params.query.trim()}%` : null
  const amenities = params.amenities?.length ? params.amenities : null
  const amenityCount = amenities?.length ?? 0
  const hasLoc = params.userLat != null && params.userLng != null
  const lat = params.userLat ?? 0
  const lng = params.userLng ?? 0

  const distanceSelect = hasLoc
    ? sql`,
        CASE WHEN h.latitude IS NOT NULL AND h.longitude IS NOT NULL
          THEN ROUND((6371 * acos(LEAST(1.0,
            cos(radians(${lat}::float)) * cos(radians(h.latitude::float))
            * cos(radians(h.longitude::float) - radians(${lng}::float))
            + sin(radians(${lat}::float)) * sin(radians(h.latitude::float))
          )))::numeric, 1)
          ELSE NULL
        END AS distance_km`
    : sql`, NULL::numeric AS distance_km`

  const distanceFilter =
    hasLoc && params.maxDistance != null
      ? sql`AND h.latitude IS NOT NULL AND h.longitude IS NOT NULL
            AND (6371 * acos(LEAST(1.0,
              cos(radians(${lat}::float)) * cos(radians(h.latitude::float))
              * cos(radians(h.longitude::float) - radians(${lng}::float))
              + sin(radians(${lat}::float)) * sin(radians(h.latitude::float))
            ))) <= ${params.maxDistance}`
      : sql``

  const orderByClause =
    params.sortBy === 'proximity' && hasLoc
      ? sql`ORDER BY distance_km ASC NULLS LAST`
      : params.sortBy === 'avg_rating'
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
      h.description,
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
      ${distanceSelect}
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
      ${distanceFilter}
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
