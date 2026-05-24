import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'
import sql from '@/lib/db'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const result = RegisterSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { email, password, firstName, lastName } = result.data
  const passwordHash = await hashPassword(password)

  let userId: number
  try {
    const rows = await sql<{ user_id: number }[]>`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (${email}, ${passwordHash}, ${firstName}, ${lastName})
      RETURNING user_id
    `
    userId = rows[0].user_id
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'An account with that email already exists' },
        { status: 409 }
      )
    }
    throw err
  }

  await createSession(userId)

  return NextResponse.json({ success: true }, { status: 201 })
}
