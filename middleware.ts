import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { signUpRedirect } from '@/lib/auth-redirect'

const COOKIE_NAME = 'session'

const PROTECTED_PREFIXES = [
  '/favorites',
  '/profile',
  '/visits',
  '/messages',
  '/host',
  '/listings',
  '/carinderias/new',
  '/dashboard',
  '/onboarding',
]

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return redirectToSignUp(request)

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    return redirectToSignUp(request)
  }
}

function redirectToSignUp(request: NextRequest): NextResponse {
  const registerUrl = new URL(signUpRedirect(request.nextUrl.pathname), request.url)
  return NextResponse.redirect(registerUrl)
}

export const config = {
  matcher: [
    '/favorites/:path*',
    '/profile/:path*',
    '/visits/:path*',
    '/messages/:path*',
    '/host/:path*',
    '/listings/:path*',
    '/listings',
    '/carinderias/new',
    '/dashboard/:path*',
    '/dashboard',
    '/onboarding',
  ],
}
