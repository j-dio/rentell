import { redirect } from 'next/navigation'
import { redirectToSignUp, safeRedirectPath } from '@/lib/auth-redirect'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'
import OnboardingClient from './OnboardingClient'

type PageProps = {
  searchParams: Promise<{ from?: string }>
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { from: fromParam } = await searchParams
  const redirectTo = safeRedirectPath(fromParam)

  const session = await getSession()
  if (!session) redirectToSignUp('/onboarding')

  const [user] = await sql<{ onboarding_completed: boolean }[]>`
    SELECT onboarding_completed FROM users WHERE user_id = ${session.userId}
  `
  if (user?.onboarding_completed) redirect(redirectTo)

  return <OnboardingClient redirectTo={redirectTo} />
}
