import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { getOwnHousing, createHousing } from '@/lib/queries/host'

const createHousingSchema = z
  .object({
    name: z.string().min(1).max(100),
    housing_type: z.enum(['dormitory', 'boarding_house', 'apartment', 'other']),
    address: z.string().min(1),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    monthly_price_min: z.number().positive().nullable().optional(),
    monthly_price_max: z.number().positive().nullable().optional(),
    contact_person: z.string().max(100).nullable().optional(),
    contact_number: z.string().max(20).nullable().optional(),
    proximity_to_campus_km: z.number().nonnegative().nullable().optional(),
    description: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) =>
      data.monthly_price_min == null ||
      data.monthly_price_max == null ||
      data.monthly_price_min <= data.monthly_price_max,
    { message: 'Min price must be less than or equal to max price.', path: ['monthly_price_min'] },
  )

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isHost) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const listings = await getOwnHousing(session.userId)
  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isHost) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createHousingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await createHousing(session.userId, parsed.data)
  return NextResponse.json(result, { status: 201 })
}
