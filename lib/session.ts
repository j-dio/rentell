import { randomBytes } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import sql from './db'

const COOKIE_NAME = 'session'
const SESSION_TTL_DAYS = 7

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSession(userId: number): Promise<void> {
  const sessionId = randomBytes(32).toString('hex') // 64 hex chars
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

  await sql`
    INSERT INTO session (session_id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `

  const token = await new SignJWT({ sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export interface SessionUser {
  userId: number
  email: string
  firstName: string
  lastName: string
  isHost: boolean
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  let sessionId: string
  try {
    const { payload } = await jwtVerify(token, getSecret())
    sessionId = payload.sessionId as string
  } catch {
    return null
  }

  const rows = await sql<SessionUser[]>`
    SELECT u.user_id   AS "userId",
           u.email,
           u.first_name AS "firstName",
           u.last_name  AS "lastName",
           u.is_host    AS "isHost"
    FROM session s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.session_id = ${sessionId}
      AND s.expires_at > now()
  `

  return rows[0] ?? null
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret())
      const sessionId = payload.sessionId as string
      await sql`DELETE FROM session WHERE session_id = ${sessionId}`
    } catch {
      // token invalid — nothing to delete in DB
    }
  }

  cookieStore.delete(COOKIE_NAME)
}
