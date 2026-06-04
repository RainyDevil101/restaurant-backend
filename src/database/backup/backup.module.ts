import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BACKUP_STORAGE, type BackupStorage } from './backup-storage.port'
import { BackupService } from './backup.service'
import { LocalDiskStorage } from './local-disk.storage'
import { S3Storage } from './s3.storage'

function createStorage(config: ConfigService): BackupStorage {
  const driver = config.get<string>('BACKUP_DRIVER', 'local')
  if (driver === 's3') {
    return new S3Storage({
      endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
      region: config.getOrThrow<string>('S3_REGION'),
      bucket: config.getOrThrow<string>('S3_BUCKET'),
      accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
      secretAccessKey: config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
      prefix: config.get<string>('S3_PREFIX', ''),
    })
  }
  const directory = config.get<string>('BACKUP_DIR', './backups')
  return new LocalDiskStorage(directory)
}

@Module({
  imports: [ConfigModule],
  providers: [
    BackupService,
    {
      provide: BACKUP_STORAGE,
      inject: [ConfigService],
      useFactory: createStorage,
    },
  ],
  exports: [BackupService],
})
export class BackupModule {}
