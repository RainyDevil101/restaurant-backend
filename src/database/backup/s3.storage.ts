import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { BackupStorage } from './backup-storage.port'
import { BACKUP_CONTENT_TYPE, BACKUP_PREFIX } from './backup-driver.constants'

export interface S3StorageConfig {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  prefix: string
}

export class S3Storage implements BackupStorage {
  private readonly client: S3Client

  constructor(private readonly config: S3StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint.startsWith('http') ? config.endpoint : `https://${config.endpoint}`,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    })
  }

  private key(filename: string): string {
    return this.config.prefix ? `${this.config.prefix}/${filename}` : filename
  }

  async upload(filename: string, contents: Buffer): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: this.key(filename),
        Body: contents,
        ContentType: BACKUP_CONTENT_TYPE.GZIP,
      }),
    )
  }

  async prune(retentionDays: number): Promise<string[]> {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    const removed: string[] = []
    let continuationToken: string | undefined

    do {
      const listed = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.config.bucket,
          Prefix: this.key(BACKUP_PREFIX),
          ContinuationToken: continuationToken,
        }),
      )
      for (const object of listed.Contents ?? []) {
        if (!object.Key || !object.LastModified) continue
        if (object.LastModified.getTime() < cutoff) {
          await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: object.Key }))
          removed.push(object.Key)
        }
      }
      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while (continuationToken)

    return removed
  }
}
