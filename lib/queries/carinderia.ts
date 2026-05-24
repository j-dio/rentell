import sql from '@/lib/db'

export type CarinderiaListItem = {
  carinderia_id: number
  name: string
  address: string
  primary_image_url: string | null
  avg_rating: string | null
}

export type CarinderiaImage = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
}

export type CarinderiaDetail = {
  carinderia_id: number
  added_by: number
  name: string
  address: string
  latitude: string | null
  longitude: string | null
  description: string | null
  created_at: Date
  updated_at: Date
  avg_rating: string | null
  images: CarinderiaImage[]
}

export async function getAllCarinderias(): Promise<CarinderiaListItem[]> {
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
    ORDER BY c.created_at DESC
  `
}

export async function getCarinderiaById(id: number): Promise<CarinderiaDetail | null> {
  const [carinderia] = await sql<CarinderiaDetail[]>`
    SELECT
      c.carinderia_id,
      c.added_by,
      c.name,
      c.address,
      c.latitude,
      c.longitude,
      c.description,
      c.created_at,
      c.updated_at,
      (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM review
        WHERE carinderia_id = c.carinderia_id
          AND listing_type = 'carinderia'
      ) AS avg_rating
    FROM carinderia c
    WHERE c.carinderia_id = ${id}
  `

  if (!carinderia) return null

  const images = await sql<CarinderiaImage[]>`
    SELECT image_id, url, caption, is_primary
    FROM carinderia_image
    WHERE carinderia_id = ${id}
    ORDER BY is_primary DESC
  `

  return { ...carinderia, images }
}
