import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user] = await sql<{ onboarding_completed: boolean }[]>`
    SELECT onboarding_completed FROM users WHERE user_id = ${session.userId}
  `
  if (user?.onboarding_completed) redirect('/')

  return <OnboardingClient />
}
