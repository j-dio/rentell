import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'
import HostToggle from './HostToggle'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user] = await sql`
    SELECT first_name, last_name, email, phone_number, bio,
           student_number, course, year_level, hometown, is_host
    FROM users
    WHERE user_id = ${session.userId}
  `

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <section className="border rounded-lg p-6 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Name" value={`${user.first_name} ${user.last_name}`} />
          <Row label="Email" value={user.email} />
          {user.phone_number && <Row label="Phone" value={user.phone_number} />}
          {user.bio && <Row label="Bio" value={user.bio} />}
        </dl>
      </section>

      {(user.student_number || user.course || user.year_level || user.hometown) && (
        <section className="border rounded-lg p-6 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Student Info</h2>
          <dl className="space-y-2 text-sm">
            {user.student_number && <Row label="Student no." value={user.student_number} />}
            {user.course        && <Row label="Course"      value={user.course} />}
            {user.year_level    && <Row label="Year"        value={String(user.year_level)} />}
            {user.hometown      && <Row label="Hometown"    value={user.hometown} />}
          </dl>
        </section>
      )}

      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Host Status</h2>
        <p className="text-sm text-muted-foreground">
          Hosts can create and manage housing listings on RenTell.
        </p>
        <HostToggle isHost={user.is_host as boolean} />
      </section>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex-1">{value}</dd>
    </div>
  )
}
