import sql from '@/lib/db'

export type DirectoryStats = {
  listings: number
  carinderias: number
}

export async function getDirectoryStats(): Promise<DirectoryStats> {
  const [housingRows, carinderiaRows] = await Promise.all([
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM housing
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM carinderia
    `,
  ])

  return {
    listings: housingRows[0]?.count ?? 0,
    carinderias: carinderiaRows[0]?.count ?? 0,
  }
}
