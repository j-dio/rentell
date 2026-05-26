import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { updateVisitStatus } from '@/lib/queries/visits'

const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'declined', 'cancelled']),
})

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const visitId = Number(id)
  if (!Number.isInteger(visitId) || visitId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await updateVisitStatus(visitId, parsed.data.status, session.userId)
  if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
