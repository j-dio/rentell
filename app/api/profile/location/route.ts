import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const locationSchema = z.object({
  preferred_location_name: z.string().min(1).max(255),
  preferred_location_lat: z.number().min(-90).max(90),
  preferred_location_lng: z.number().min(-180).max(180),
})

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = locationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await sql`
    UPDATE users
    SET preferred_location_name = ${parsed.data.preferred_location_name},
        preferred_location_lat  = ${parsed.data.preferred_location_lat},
        preferred_location_lng  = ${parsed.data.preferred_location_lng},
        updated_at              = now()
    WHERE user_id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}
