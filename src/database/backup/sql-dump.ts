import { gzipSync } from 'zlib'
import { Client } from 'pg'
import { BACKUP_PREFIX } from './backup-driver.constants'

export interface DumpResult {
  filename: string
  contents: Buffer
  tableCounts: Record<string, number>
}

function quote(text: string): string {
  return `'${text.replace(/'/g, "''")}'`
}

function literal(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value instanceof Date) return quote(value.toISOString())
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') return quote(JSON.stringify(value))
  return quote(String(value))
}

export async function createDump(databaseUrl: string): Promise<DumpResult> {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const { rows: tableRows } = await client.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname = 'public' order by tablename",
    )
    const tables = tableRows.map((row) => row.tablename)
    const counts: Record<string, number> = {}
    const lines: string[] = ['BEGIN;']

    for (const table of tables) {
      lines.push(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`)
    }

    for (const table of tables) {
      const { rows } = await client.query(`SELECT * FROM "${table}"`)
      counts[table] = rows.length
      if (rows.length === 0) continue
      const columns = Object.keys(rows[0])
      const columnList = columns.map((column) => `"${column}"`).join(', ')
      for (const row of rows) {
        const values = columns.map((column) => literal(row[column])).join(', ')
        lines.push(`INSERT INTO "${table}" (${columnList}) VALUES (${values});`)
      }
    }

    lines.push('COMMIT;')
    const sql = lines.join('\n') + '\n'
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    return {
      filename: `${BACKUP_PREFIX}${stamp}.sql.gz`,
      contents: gzipSync(Buffer.from(sql, 'utf8')),
      tableCounts: counts,
    }
  } finally {
    await client.end()
  }
}
