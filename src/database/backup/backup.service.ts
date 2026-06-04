import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { ENV_DEFAULTS } from '../../shared/constants/env-defaults.constants'
import { BACKUP_STORAGE, type BackupStorage } from './backup-storage.port'
import { createDump } from './sql-dump'

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name)

  constructor(
    private readonly config: ConfigService,
    @Inject(BACKUP_STORAGE) private readonly storage: BackupStorage,
  ) {}

  @Cron(process.env.BACKUP_CRON ?? ENV_DEFAULTS.BACKUP_CRON, {
    name: 'daily-db-backup',
    timeZone: process.env.BACKUP_TIMEZONE ?? ENV_DEFAULTS.BACKUP_TIMEZONE,
  })
  async handleDailyBackup(): Promise<void> {
    try {
      await this.run()
    } catch (error) {
      this.logger.error(`Scheduled backup failed: ${(error as Error).message}`, (error as Error).stack)
    }
  }

  async run(): Promise<string> {
    const databaseUrl = this.config.getOrThrow<string>('DATABASE_URL')
    const retentionDays = this.config.get<number>('BACKUP_RETENTION_DAYS', ENV_DEFAULTS.BACKUP_RETENTION_DAYS)

    const dump = await createDump(databaseUrl)
    await this.storage.upload(dump.filename, dump.contents)
    const removed = await this.storage.prune(retentionDays)

    const totalRows = Object.values(dump.tableCounts).reduce((sum, count) => sum + count, 0)
    const sizeKb = (dump.contents.length / 1024).toFixed(1)
    this.logger.log(
      `Backup ${dump.filename} uploaded — ${totalRows} rows, ${sizeKb} KB. Pruned ${removed.length} expired backup(s).`,
    )
    return dump.filename
  }
}
