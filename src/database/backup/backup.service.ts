import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { ENVS } from '../../config/env.config'
import { BACKUP_STORAGE, type BackupStorage } from './backup-storage.port'
import { BACKUP_JOB } from './backup-job.constants'
import { createDump } from './sql-dump'

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(BACKUP_STORAGE) private readonly storage: BackupStorage,
  ) {}

  onModuleInit() {
    const job = new CronJob(
      this.config.getOrThrow<string>(ENVS.BACKUP_CRON),
      () => this.handleDailyBackup(),
      null,
      true,
      this.config.getOrThrow<string>(ENVS.BACKUP_TIMEZONE),
    )
    this.schedulerRegistry.addCronJob(BACKUP_JOB.DAILY_DB_BACKUP, job)
  }

  async handleDailyBackup(): Promise<void> {
    try {
      await this.run()
    } catch (error) {
      this.logger.error(`Scheduled backup failed: ${(error as Error).message}`, (error as Error).stack)
    }
  }

  async run(): Promise<string> {
    const databaseUrl = this.config.getOrThrow<string>(ENVS.DATABASE_URL)
    const retentionDays = this.config.getOrThrow<number>(ENVS.BACKUP_RETENTION_DAYS)

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
