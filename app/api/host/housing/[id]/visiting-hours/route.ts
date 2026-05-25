import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { setVisitingHours, removeVisitingHours } from '@/lib/queries/host'

const addHoursSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
})

const deleteHoursSchema = z.object({
  id: z.number().int().positive(),
})

type Params = { params: Promise<{ id: string }> }

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
  const parsed = addHoursSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.end_time <= parsed.data.start_time) {
    return NextResponse.json({ error: 'end_time must be after start_time' }, { status: 400 })
  }

  try {
    const result = await setVisitingHours(
      housingId,
      session.userId,
      parsed.data.day_of_week,
      parsed.data.start_time,
      parsed.data.end_time,
    )
    if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      return NextResponse.json({ error: 'A slot with that day and start time already exists' }, { status: 409 })
    }
    throw err
  }
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
  const parsed = deleteHoursSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const deleted = await removeVisitingHours(parsed.data.id, housingId, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
