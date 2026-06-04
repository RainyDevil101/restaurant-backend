export const BACKUP_DRIVER = {
  LOCAL: 'local',
  S3: 's3',
} as const

export type BackupDriverValue = (typeof BACKUP_DRIVER)[keyof typeof BACKUP_DRIVER]

export const BACKUP_PREFIX = 'subito-backup-'

export const BACKUP_CONTENT_TYPE = {
  GZIP: 'application/gzip',
} as const
