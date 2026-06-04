export interface StoredBackup {
  name: string
  createdAt: Date
}

export interface BackupStorage {
  upload(filename: string, contents: Buffer): Promise<void>
  prune(retentionDays: number): Promise<string[]>
}

export const BACKUP_STORAGE = Symbol('BACKUP_STORAGE')
