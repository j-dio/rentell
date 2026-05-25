import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { createRoom, updateRoom, deleteRoom } from '@/lib/queries/host'

const createRoomSchema = z.object({
  room_number: z.string().max(20).nullable().optional(),
  room_type: z.enum(['private', 'shared', 'bedspacer']),
  capacity: z.number().int().positive(),
  available_slots: z.number().int().min(0),
  monthly_price: z.number().positive(),
})

const updateRoomSchema = z.object({
  room_id: z.number().int().positive(),
  room_number: z.string().max(20).nullable().optional(),
  room_type: z.enum(['private', 'shared', 'bedspacer']).optional(),
  capacity: z.number().int().positive().optional(),
  available_slots: z.number().int().min(0).optional(),
  monthly_price: z.number().positive().optional(),
})

const deleteRoomSchema = z.object({
  room_id: z.number().int().positive(),
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
  const parsed = createRoomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.available_slots > parsed.data.capacity) {
    return NextResponse.json({ error: 'available_slots cannot exceed capacity' }, { status: 400 })
  }

  const result = await createRoom(housingId, session.userId, parsed.data)
  if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json(result, { status: 201 })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateRoomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { room_id, ...fields } = parsed.data
  await updateRoom(room_id, housingId, session.userId, fields)
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
  const parsed = deleteRoomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const deleted = await deleteRoom(parsed.data.room_id, housingId, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
