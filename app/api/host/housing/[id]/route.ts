import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { updateHousing, deleteHousing } from '@/lib/queries/host'

const updateHousingSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    housing_type: z.enum(['dormitory', 'boarding_house', 'apartment', 'other']).optional(),
    address: z.string().min(1).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    monthly_price_min: z.number().positive().nullable().optional(),
    monthly_price_max: z.number().positive().nullable().optional(),
    contact_person: z.string().max(100).nullable().optional(),
    contact_number: z.string().max(20).nullable().optional(),
    description: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) =>
      data.monthly_price_min == null ||
      data.monthly_price_max == null ||
      data.monthly_price_min <= data.monthly_price_max,
    { message: 'Min price must be less than or equal to max price.', path: ['monthly_price_min'] },
  )

type Params = { params: Promise<{ id: string }> }

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
  const parsed = updateHousingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await updateHousing(housingId, session.userId, parsed.data)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const housingId = Number(id)
  if (!Number.isInteger(housingId) || housingId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const deleted = await deleteHousing(housingId, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
