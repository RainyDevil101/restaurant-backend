import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../app.module'
import { BackupService } from './backup.service'

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] })
  try {
    const service = app.get(BackupService)
    const filename = await service.run()
    console.log(`Backup created: ${filename}`)
  } finally {
    await app.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
