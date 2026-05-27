import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { updateCarinderia, deleteCarinderia } from '@/lib/queries/carinderia'

const updateCarinderiaSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const carinderiaId = Number(id)
  if (!Number.isInteger(carinderiaId) || carinderiaId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateCarinderiaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const updated = await updateCarinderia(carinderiaId, session.userId, parsed.data)
    if (!updated) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update carinderia' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const carinderiaId = Number(id)
  if (!Number.isInteger(carinderiaId) || carinderiaId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const deleted = await deleteCarinderia(carinderiaId, session.userId)
    if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete carinderia' }, { status: 500 })
  }
}
