import { readFileSync } from 'fs'
import { gunzipSync } from 'zlib'
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from '../../app.module'

async function main(): Promise<void> {
  const path = process.argv[2]
  if (!path) {
    throw new Error('Usage: pnpm backup:restore <path-to-backup.sql.gz>')
  }

  const raw = readFileSync(path)
  const sql = path.endsWith('.gz') ? gunzipSync(raw).toString('utf8') : raw.toString('utf8')

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] })
  try {
    const dataSource = app.get(DataSource)
    await dataSource.query(sql)
    console.log(`Restore complete from ${path}`)
  } finally {
    await app.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
