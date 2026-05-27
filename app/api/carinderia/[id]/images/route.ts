import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { addCarinderiaImage, removeCarinderiaImage } from '@/lib/queries/carinderia'

const addImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().max(200).nullable().optional(),
  is_primary: z.boolean().optional(),
})

const deleteImageSchema = z.object({
  image_id: z.number().int().positive(),
})

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const carinderiaId = Number(id)
  if (!Number.isInteger(carinderiaId) || carinderiaId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = addImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await addCarinderiaImage(
      carinderiaId,
      session.userId,
      parsed.data.url,
      parsed.data.caption,
      parsed.data.is_primary ?? false,
    )
    if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const carinderiaId = Number(id)
  if (!Number.isInteger(carinderiaId) || carinderiaId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = deleteImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const deleted = await removeCarinderiaImage(parsed.data.image_id, carinderiaId, session.userId)
    if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}
