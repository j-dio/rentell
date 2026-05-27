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
      c.avg_rating
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
      c.avg_rating
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

export type CreateCarinderiaData = {
  name: string
  address: string
  description?: string | null
}

export async function createCarinderia(
  addedBy: number,
  data: CreateCarinderiaData,
): Promise<{ carinderia_id: number }> {
  const [row] = await sql<{ carinderia_id: number }[]>`
    INSERT INTO carinderia (added_by, name, address, description)
    VALUES (
      ${addedBy},
      ${data.name},
      ${data.address},
      ${data.description ?? null}
    )
    RETURNING carinderia_id
  `
  return row
}

// ── Carinderia Images ─────────────────────────────────────────────────────────

export async function getOwnCarinderias(userId: number): Promise<CarinderiaListItem[]> {
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
      c.avg_rating
    FROM carinderia c
    WHERE c.added_by = ${userId}
    ORDER BY c.created_at DESC
  `
}

export async function updateCarinderia(
  carinderiaId: number,
  userId: number,
  data: { name?: string; address?: string; description?: string | null },
): Promise<boolean> {
  const rows = await sql`
    UPDATE carinderia
    SET name        = COALESCE(${data.name ?? null}, name),
        address     = COALESCE(${data.address ?? null}, address),
        description = ${data.description !== undefined ? data.description : sql`description`},
        updated_at  = now()
    WHERE carinderia_id = ${carinderiaId}
      AND added_by      = ${userId}
    RETURNING carinderia_id
  `
  return rows.length > 0
}

export async function deleteCarinderia(
  carinderiaId: number,
  userId: number,
): Promise<boolean> {
  const rows = await sql`
    DELETE FROM carinderia
    WHERE carinderia_id = ${carinderiaId}
      AND added_by = ${userId}
    RETURNING carinderia_id
  `
  return rows.length > 0
}

export async function addCarinderiaImage(
  carinderiaId: number,
  addedBy: number,
  url: string,
  caption?: string | null,
  isPrimary = false,
): Promise<CarinderiaImage | undefined> {
  const rows = await sql<CarinderiaImage[]>`
    INSERT INTO carinderia_image (carinderia_id, url, caption, is_primary)
    SELECT ${carinderiaId}, ${url}, ${caption ?? null}, ${isPrimary}
    FROM carinderia
    WHERE carinderia_id = ${carinderiaId}
      AND added_by      = ${addedBy}
    RETURNING image_id, url, caption, is_primary
  `
  return rows[0]
}

export async function removeCarinderiaImage(
  imageId: number,
  carinderiaId: number,
  addedBy: number,
): Promise<boolean> {
  const rows = await sql`
    DELETE FROM carinderia_image
    WHERE image_id      = ${imageId}
      AND carinderia_id IN (
        SELECT carinderia_id FROM carinderia
        WHERE carinderia_id = ${carinderiaId}
          AND added_by      = ${addedBy}
      )
    RETURNING image_id
  `
  return rows.length > 0
}
