import LandingPage from '@/components/landing/LandingPage'
import { getDirectoryStats } from '@/lib/queries/stats'
import { getSession } from '@/lib/session'

export default async function Page() {
  const [stats, session] = await Promise.all([getDirectoryStats(), getSession()])

  return <LandingPage stats={stats} isLoggedIn={session !== null} />
}