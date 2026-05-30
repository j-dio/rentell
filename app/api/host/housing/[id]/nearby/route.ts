import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import {
  linkCarinderia,
  unlinkCarinderia,
  linkEssential,
  unlinkEssential,
} from '@/lib/queries/host'

const linkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('carinderia'),
    carinderia_id: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('essential'),
    essential_id: z.number().int().positive(),
  }),
])

const unlinkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('carinderia'),
    carinderia_id: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('essential'),
    essential_id: z.number().int().positive(),
  }),
])

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
  const parsed = linkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let result
  if (parsed.data.type === 'carinderia') {
    result = await linkCarinderia(housingId, session.userId, parsed.data.carinderia_id)
  } else {
    result = await linkEssential(housingId, session.userId, parsed.data.essential_id)
  }

  if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
  return NextResponse.json(result, { status: 201 })
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
  const parsed = unlinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let deleted
  if (parsed.data.type === 'carinderia') {
    deleted = await unlinkCarinderia(housingId, session.userId, parsed.data.carinderia_id)
  } else {
    deleted = await unlinkEssential(housingId, session.userId, parsed.data.essential_id)
  }

  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
  return NextResponse.json({ success: true })
}
