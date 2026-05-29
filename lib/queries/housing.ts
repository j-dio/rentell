import sql from '@/lib/db'

export type HousingListItem = {
  housing_id: number
  name: string
  housing_type: string
  address: string
  monthly_price_min: string | null
  monthly_price_max: string | null
  proximity_to_campus_km: string | null
  description: string | null
  primary_image_url: string | null
  avg_rating: string | null
}

export type Room = {
  room_id: number
  room_number: string | null
  room_type: string
  capacity: number
  available_slots: number
  monthly_price: string
}

export type HousingImage = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
  sort_order: number
}

export type NearbyCarinderia = {
  carinderia_id: number
  name: string
  address: string
  distance_km: string | null
}

export type NearbyEssential = {
  essential_id: number
  name: string
  type: string
  address: string
  distance_km: string | null
}

export type HousingDetail = {
  housing_id: number
  owner_id: number
  name: string
  housing_type: string
  address: string
  latitude: string | null
  longitude: string | null
  monthly_price_min: string | null
  monthly_price_max: string | null
  contact_person: string | null
  contact_number: string | null
  proximity_to_campus_km: string | null
  description: string | null
  created_at: Date
  updated_at: Date
  avg_rating: string | null
  rooms: Room[]
  amenities: string[]
  images: HousingImage[]
  nearby_carinderias: NearbyCarinderia[]
  nearby_essentials: NearbyEssential[]
}

export async function getAllHousing(): Promise<HousingListItem[]> {
  return sql<HousingListItem[]>`
    SELECT
      h.housing_id,
      h.name,
      h.housing_type,
      h.address,
      h.monthly_price_min,
      h.monthly_price_max,
      h.proximity_to_campus_km,
      h.description,
      (
        SELECT url
        FROM housing_image
        WHERE housing_id = h.housing_id
        ORDER BY is_primary DESC, sort_order ASC
        LIMIT 1
      ) AS primary_image_url,
      h.avg_rating
    FROM housing h
    ORDER BY h.created_at DESC
  `
}

export async function getHousingById(id: number): Promise<HousingDetail | null> {
  const [housing] = await sql<HousingDetail[]>`
    SELECT
      h.housing_id,
      h.owner_id,
      h.name,
      h.housing_type,
      h.address,
      h.latitude,
      h.longitude,
      h.monthly_price_min,
      h.monthly_price_max,
      h.contact_person,
      h.contact_number,
      h.proximity_to_campus_km,
      h.description,
      h.created_at,
      h.updated_at,
      h.avg_rating
    FROM housing h
    WHERE h.housing_id = ${id}
  `

  if (!housing) return null

  const [rooms, amenityRows, images, carinderiaRows, essentialRows] = await Promise.all([
    sql<Room[]>`
      SELECT
        room_id,
        room_number,
        room_type,
        capacity,
        available_slots,
        monthly_price
      FROM room
      WHERE housing_id = ${id}
      ORDER BY room_number ASC
    `,
    sql<{ amenity_name: string }[]>`
      SELECT amenity_name
      FROM housing_amenity
      WHERE housing_id = ${id}
      ORDER BY amenity_name ASC
    `,
    sql<HousingImage[]>`
      SELECT image_id, url, caption, is_primary, sort_order
      FROM housing_image
      WHERE housing_id = ${id}
      ORDER BY is_primary DESC, sort_order ASC
    `,
    sql<NearbyCarinderia[]>`
      SELECT
        c.carinderia_id,
        c.name,
        c.address,
        hc.distance_km
      FROM housing_carinderia hc
      JOIN carinderia c ON c.carinderia_id = hc.carinderia_id
      WHERE hc.housing_id = ${id}
      ORDER BY hc.distance_km ASC NULLS LAST
    `,
    sql<NearbyEssential[]>`
      SELECT
        e.essential_id,
        e.name,
        e.type,
        e.address,
        he.distance_km
      FROM housing_essential he
      JOIN essential e ON e.essential_id = he.essential_id
      WHERE he.housing_id = ${id}
      ORDER BY he.distance_km ASC NULLS LAST
    `,
  ])

  return {
    ...housing,
    rooms,
    amenities: amenityRows.map((r) => r.amenity_name),
    images,
    nearby_carinderias: carinderiaRows,
    nearby_essentials: essentialRows,
  }
}
