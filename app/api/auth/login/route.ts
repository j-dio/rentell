import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'
import sql from '@/lib/db'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const result = LoginSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { email, password } = result.data

  const rows = await sql<{ user_id: number; password_hash: string; onboarding_completed: boolean }[]>`
    SELECT user_id, password_hash, onboarding_completed
    FROM users
    WHERE email = ${email}
  `

  const user = rows[0]
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  await createSession(user.user_id)

  return NextResponse.json({ success: true, onboardingCompleted: user.onboarding_completed })
}
