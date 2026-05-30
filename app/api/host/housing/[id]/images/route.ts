import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { addHousingImage, removeHousingImage } from '@/lib/queries/host'

const addImageSchema = z.object({
  url: z.union([z.string().url(), z.string().startsWith('/api/images/')]),
  caption: z.string().max(200).nullable().optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

const deleteImageSchema = z.object({
  image_id: z.number().int().positive(),
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
  const parsed = addImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await addHousingImage(
    housingId,
    session.userId,
    parsed.data.url,
    parsed.data.caption,
    parsed.data.is_primary ?? false,
    parsed.data.sort_order ?? 0,
  )
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
  const parsed = deleteImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const deleted = await removeHousingImage(parsed.data.image_id, housingId, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
