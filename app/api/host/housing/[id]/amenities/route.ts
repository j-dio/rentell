import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const bodySchema = z.object({
  amenity_name: z.string().min(1),
})

type Params = { params: Promise<{ id: string }> }

async function verifyOwnership(housingId: number, userId: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM housing WHERE housing_id = ${housingId} AND owner_id = ${userId}
  `
  return rows.length > 0
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (!(await verifyOwnership(housingId, session.userId))) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
  }

  // ON CONFLICT DO NOTHING: already tagged is not an error — just succeed silently
  await sql`
    INSERT INTO housing_amenity (housing_id, amenity_name)
    VALUES (${housingId}, ${parsed.data.amenity_name})
    ON CONFLICT (housing_id, amenity_name) DO NOTHING
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (!(await verifyOwnership(housingId, session.userId))) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
  }

  await sql`
    DELETE FROM housing_amenity
    WHERE housing_id = ${housingId} AND amenity_name = ${parsed.data.amenity_name}
  `
  return NextResponse.json({ success: true })
}
