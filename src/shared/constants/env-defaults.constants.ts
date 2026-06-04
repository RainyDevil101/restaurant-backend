export const ENV_DEFAULTS = {
  PORT: 3001,
  CORS_ORIGIN: 'http://localhost:5173',
  JWT_EXPIRES_IN: '7d',
  THROTTLE_TTL: 60000,
  THROTTLE_LIMIT: 100,
  AUTH_THROTTLE_TTL: 60000,
  AUTH_THROTTLE_LIMIT: 5,
  BACKUP_CRON: '0 12 * * *',
  BACKUP_TIMEZONE: 'UTC',
  BACKUP_RETENTION_DAYS: 14,
  BACKUP_DIR: './backups',
  BACKUP_DRIVER: 'local',
} as const

export const HTTP_CONFIG = {
  BODY_LIMIT: '100kb',
  GLOBAL_PREFIX: 'api',
} as const
