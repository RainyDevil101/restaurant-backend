import { mkdir, readdir, stat, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import type { BackupStorage } from './backup-storage.port'
import { BACKUP_PREFIX } from './backup-driver.constants'

export class LocalDiskStorage implements BackupStorage {
  constructor(private readonly directory: string) {}

  async upload(filename: string, contents: Buffer): Promise<void> {
    await mkdir(this.directory, { recursive: true })
    await writeFile(join(this.directory, filename), contents)
  }

  async prune(retentionDays: number): Promise<string[]> {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    const entries = await readdir(this.directory).catch(() => [] as string[])
    const removed: string[] = []
    for (const entry of entries) {
      if (!entry.startsWith(BACKUP_PREFIX)) continue
      const fullPath = join(this.directory, entry)
      const info = await stat(fullPath)
      if (info.mtimeMs < cutoff) {
        await unlink(fullPath)
        removed.push(entry)
      }
    }
    return removed
  }
}
