import sql from '@/lib/db'

export type Visit = {
  visit_id: number
  visitor_id: number
  visitor_name: string
  housing_id: number
  scheduled_at: Date
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  note: string | null
  created_at: Date
  updated_at: Date
}

export type VisitingHour = {
  id: number
  housing_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export async function getVisitsByHousing(housingId: number): Promise<Visit[]> {
  return sql<Visit[]>`
    SELECT
      v.visit_id,
      v.visitor_id,
      u.first_name || ' ' || u.last_name AS visitor_name,
      v.housing_id,
      v.scheduled_at,
      v.status,
      v.note,
      v.created_at,
      v.updated_at
    FROM visit v
    JOIN users u ON u.user_id = v.visitor_id
    WHERE v.housing_id = ${housingId}
    ORDER BY v.scheduled_at ASC
  `
}

export type IncomingVisit = Visit & { housing_name: string }

export async function getIncomingVisitsByHost(ownerId: number): Promise<IncomingVisit[]> {
  return sql<IncomingVisit[]>`
    SELECT
      v.visit_id,
      v.visitor_id,
      u.first_name || ' ' || u.last_name AS visitor_name,
      v.housing_id,
      h.name AS housing_name,
      v.scheduled_at,
      v.status,
      v.note,
      v.created_at,
      v.updated_at
    FROM visit v
    JOIN users u ON u.user_id = v.visitor_id
    JOIN housing h ON h.housing_id = v.housing_id
    WHERE h.owner_id = ${ownerId}
    ORDER BY v.scheduled_at ASC
  `
}

export async function getVisitsByUser(userId: number): Promise<Visit[]> {
  return sql<Visit[]>`
    SELECT
      v.visit_id,
      v.visitor_id,
      u.first_name || ' ' || u.last_name AS visitor_name,
      v.housing_id,
      v.scheduled_at,
      v.status,
      v.note,
      v.created_at,
      v.updated_at
    FROM visit v
    JOIN users u ON u.user_id = v.visitor_id
    WHERE v.visitor_id = ${userId}
    ORDER BY v.scheduled_at DESC
  `
}

export async function createVisit(
  visitorId: number,
  housingId: number,
  scheduledAt: Date,
  note?: string | null,
) {
  const rows = await sql<{ visit_id: number }[]>`
    INSERT INTO visit (visitor_id, housing_id, scheduled_at, note)
    VALUES (${visitorId}, ${housingId}, ${scheduledAt}, ${note ?? null})
    RETURNING visit_id
  `
  return rows[0]
}

export async function updateVisitStatus(
  visitId: number,
  status: 'confirmed' | 'declined' | 'cancelled',
  actorId: number,
) {
  const rows = await sql<{ visit_id: number }[]>`
    UPDATE visit
    SET status     = ${status},
        updated_at = now()
    WHERE visit_id = ${visitId}
      AND (
        visitor_id = ${actorId}
        OR housing_id IN (
          SELECT housing_id FROM housing WHERE owner_id = ${actorId}
        )
      )
    RETURNING visit_id
  `
  return rows[0] as { visit_id: number } | undefined
}

export async function getVisitingHoursByHousing(housingId: number): Promise<VisitingHour[]> {
  return sql<VisitingHour[]>`
    SELECT id, housing_id, day_of_week, start_time, end_time
    FROM housing_visiting_hours
    WHERE housing_id = ${housingId}
    ORDER BY day_of_week ASC, start_time ASC
  `
}
