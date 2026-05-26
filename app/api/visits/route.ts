import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { createVisit } from '@/lib/queries/visits'

const createVisitSchema = z.object({
  housing_id:   z.number().int().positive(),
  scheduled_at: z.string().datetime(),
  note:         z.string().max(1000).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { housing_id, scheduled_at, note } = parsed.data

  const result = await createVisit(
    session.userId,
    housing_id,
    new Date(scheduled_at),
    note,
  )
  return NextResponse.json(result, { status: 201 })
}
