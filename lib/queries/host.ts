import sql from '@/lib/db'

// ── Housing ──────────────────────────────────────────────────────────────────

export async function getOwnHousing(ownerId: number) {
  return sql`
    SELECT h.housing_id,
           h.name,
           h.housing_type,
           h.address,
           h.monthly_price_min,
           h.monthly_price_max,
           h.proximity_to_campus_km,
           h.created_at,
           (SELECT url FROM housing_image
            WHERE housing_id = h.housing_id
            ORDER BY is_primary DESC, sort_order ASC
            LIMIT 1) AS primary_image_url
    FROM housing h
    WHERE h.owner_id = ${ownerId}
    ORDER BY h.created_at DESC
  `
}

export interface CreateHousingInput {
  name: string
  housing_type: string
  address: string
  latitude?: number | null
  longitude?: number | null
  monthly_price_min?: number | null
  monthly_price_max?: number | null
  contact_person?: string | null
  contact_number?: string | null
  proximity_to_campus_km?: number | null
  description?: string | null
}

export async function createHousing(ownerId: number, data: CreateHousingInput) {
  const rows = await sql`
    INSERT INTO housing (
      owner_id, name, housing_type, address,
      latitude, longitude,
      monthly_price_min, monthly_price_max,
      contact_person, contact_number,
      proximity_to_campus_km, description
    ) VALUES (
      ${ownerId}, ${data.name}, ${data.housing_type}, ${data.address},
      ${data.latitude ?? null}, ${data.longitude ?? null},
      ${data.monthly_price_min ?? null}, ${data.monthly_price_max ?? null},
      ${data.contact_person ?? null}, ${data.contact_number ?? null},
      ${data.proximity_to_campus_km ?? null}, ${data.description ?? null}
    )
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number }
}

export async function updateHousing(housingId: number, ownerId: number, data: Partial<CreateHousingInput>) {
  await sql`
    UPDATE housing
    SET name                    = COALESCE(${data.name ?? null}, name),
        housing_type            = COALESCE(${data.housing_type ?? null}, housing_type),
        address                 = COALESCE(${data.address ?? null}, address),
        latitude                = ${data.latitude !== undefined ? data.latitude : sql`latitude`},
        longitude               = ${data.longitude !== undefined ? data.longitude : sql`longitude`},
        monthly_price_min       = ${data.monthly_price_min !== undefined ? data.monthly_price_min : sql`monthly_price_min`},
        monthly_price_max       = ${data.monthly_price_max !== undefined ? data.monthly_price_max : sql`monthly_price_max`},
        contact_person          = ${data.contact_person !== undefined ? data.contact_person : sql`contact_person`},
        contact_number          = ${data.contact_number !== undefined ? data.contact_number : sql`contact_number`},
        proximity_to_campus_km  = ${data.proximity_to_campus_km !== undefined ? data.proximity_to_campus_km : sql`proximity_to_campus_km`},
        description             = ${data.description !== undefined ? data.description : sql`description`},
        updated_at              = now()
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
  `
}

export async function deleteHousing(housingId: number, ownerId: number) {
  const rows = await sql`
    DELETE FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export interface CreateRoomInput {
  room_number?: string | null
  room_type: string
  capacity: number
  available_slots: number
  monthly_price: number
}

export async function createRoom(housingId: number, ownerId: number, data: CreateRoomInput) {
  const rows = await sql`
    INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
    SELECT ${housingId}, ${data.room_number ?? null}, ${data.room_type},
           ${data.capacity}, ${data.available_slots}, ${data.monthly_price}
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    RETURNING room_id
  `
  return rows[0] as { room_id: number } | undefined
}

export async function updateRoom(roomId: number, housingId: number, ownerId: number, data: Partial<CreateRoomInput>) {
  await sql`
    UPDATE room r
    SET room_number     = COALESCE(${data.room_number ?? null}, r.room_number),
        room_type       = COALESCE(${data.room_type ?? null}, r.room_type),
        capacity        = COALESCE(${data.capacity ?? null}, r.capacity),
        available_slots = COALESCE(${data.available_slots ?? null}, r.available_slots),
        monthly_price   = COALESCE(${data.monthly_price ?? null}, r.monthly_price),
        updated_at      = now()
    FROM housing h
    WHERE r.room_id    = ${roomId}
      AND r.housing_id = ${housingId}
      AND h.housing_id = r.housing_id
      AND h.owner_id   = ${ownerId}
  `
}

export async function deleteRoom(roomId: number, housingId: number, ownerId: number) {
  const rows = await sql`
    DELETE FROM room
    WHERE room_id    = ${roomId}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING room_id
  `
  return rows[0] as { room_id: number } | undefined
}

// ── Housing Images ────────────────────────────────────────────────────────────

export type HousingImageRow = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
  sort_order: number
}

export async function addHousingImage(
  housingId: number,
  ownerId: number,
  url: string,
  caption?: string | null,
  isPrimary = false,
  sortOrder = 0,
): Promise<HousingImageRow | undefined> {
  const rows = await sql<HousingImageRow[]>`
    INSERT INTO housing_image (housing_id, url, caption, is_primary, sort_order)
    SELECT ${housingId}, ${url}, ${caption ?? null}, ${isPrimary}, ${sortOrder}
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    RETURNING image_id, url, caption, is_primary, sort_order
  `
  return rows[0]
}

export async function removeHousingImage(imageId: number, housingId: number, ownerId: number) {
  const rows = await sql`
    DELETE FROM housing_image
    WHERE image_id   = ${imageId}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING image_id
  `
  return rows[0] as { image_id: number } | undefined
}

// ── Visiting Hours ────────────────────────────────────────────────────────────

export async function setVisitingHours(
  housingId: number,
  ownerId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
) {
  const rows = await sql`
    INSERT INTO housing_visiting_hours (housing_id, day_of_week, start_time, end_time)
    SELECT ${housingId}, ${dayOfWeek}, ${startTime}::time, ${endTime}::time
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    RETURNING id
  `
  return rows[0] as { id: number } | undefined
}

export async function removeVisitingHours(id: number, housingId: number, ownerId: number) {
  const rows = await sql`
    DELETE FROM housing_visiting_hours
    WHERE id         = ${id}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING id
  `
  return rows[0] as { id: number } | undefined
}

// ── Nearby Carinderias ────────────────────────────────────────────────────────

export async function linkCarinderia(housingId: number, ownerId: number, carinderia_id: number, distance_km?: number | null) {
  const rows = await sql`
    INSERT INTO housing_carinderia (housing_id, carinderia_id, distance_km)
    SELECT ${housingId}, ${carinderia_id}, ${distance_km ?? null}
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    ON CONFLICT (housing_id, carinderia_id) DO UPDATE SET distance_km = EXCLUDED.distance_km
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

export async function unlinkCarinderia(housingId: number, ownerId: number, carinderia_id: number) {
  const rows = await sql`
    DELETE FROM housing_carinderia
    WHERE housing_id   = ${housingId}
      AND carinderia_id = ${carinderia_id}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

// ── Nearby Essentials ─────────────────────────────────────────────────────────

export async function linkEssential(housingId: number, ownerId: number, essential_id: number, distance_km?: number | null) {
  const rows = await sql`
    INSERT INTO housing_essential (housing_id, essential_id, distance_km)
    SELECT ${housingId}, ${essential_id}, ${distance_km ?? null}
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    ON CONFLICT (housing_id, essential_id) DO UPDATE SET distance_km = EXCLUDED.distance_km
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

export async function unlinkEssential(housingId: number, ownerId: number, essential_id: number) {
  const rows = await sql`
    DELETE FROM housing_essential
    WHERE housing_id  = ${housingId}
      AND essential_id = ${essential_id}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

// ── Amenities ─────────────────────────────────────────────────────────────────

export async function tagAmenity(housingId: number, ownerId: number, amenityName: string) {
  const rows = await sql`
    INSERT INTO housing_amenity (housing_id, amenity_name)
    SELECT ${housingId}, ${amenityName}
    FROM housing
    WHERE housing_id = ${housingId}
      AND owner_id   = ${ownerId}
    ON CONFLICT (housing_id, amenity_name) DO NOTHING
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}

export async function untagAmenity(housingId: number, ownerId: number, amenityName: string) {
  const rows = await sql`
    DELETE FROM housing_amenity
    WHERE housing_id   = ${housingId}
      AND amenity_name = ${amenityName}
      AND housing_id IN (
        SELECT housing_id FROM housing
        WHERE housing_id = ${housingId}
          AND owner_id   = ${ownerId}
      )
    RETURNING housing_id
  `
  return rows[0] as { housing_id: number } | undefined
}
