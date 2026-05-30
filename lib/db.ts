import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const _sql = neon(process.env.DATABASE_URL)

function sql<T = Record<string, any>[]>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T> {
  return _sql(strings, ...values) as unknown as Promise<T>
}

export default sql
