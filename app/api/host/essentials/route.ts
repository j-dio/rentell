import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const createEssentialSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createEssentialSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, type, address, latitude, longitude } = parsed.data

  try {
    const rows = await sql<{ essential_id: number }[]>`
      INSERT INTO essential (added_by, name, type, address, latitude, longitude)
      VALUES (
        ${session.userId},
        ${name},
        ${type},
        ${address},
        ${latitude ?? null},
        ${longitude ?? null}
      )
      RETURNING essential_id
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create essential' }, { status: 500 })
  }
}
