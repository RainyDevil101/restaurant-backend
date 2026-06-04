import Joi from 'joi'
import { BACKUP_DRIVER } from '../database/backup/backup-driver.constants'
import { ENV_DEFAULTS } from '../shared/constants/env-defaults.constants'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3001),

  CORS_ORIGIN: Joi.string()
    .default(ENV_DEFAULTS.CORS_ORIGIN)
    .custom((value, helpers) => {
      const origins = value
        .split(',')
        .map((origin: string) => origin.trim())
        .filter(Boolean)
      const allValid = origins.length > 0 && origins.every((origin: string) => /^https?:\/\/[^\s,]+$/.test(origin))
      return allValid ? value : helpers.error('any.invalid')
    })
    .messages({
      'any.invalid': 'CORS_ORIGIN must be one or more http(s) URLs separated by commas',
    }),

  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.min': 'JWT_SECRET must be at least 16 characters for security',
    'any.required': 'JWT_SECRET is required',
  }),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default(ENV_DEFAULTS.JWT_EXPIRES_IN)
    .messages({
      'string.pattern.base': 'JWT_EXPIRES_IN must be a duration like 60s, 15m, 7d, or 1h',
    }),

  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
  }),

  THROTTLE_TTL: Joi.number().integer().min(1000).default(ENV_DEFAULTS.THROTTLE_TTL),

  THROTTLE_LIMIT: Joi.number().integer().min(1).default(ENV_DEFAULTS.THROTTLE_LIMIT),

  BACKUP_CRON: Joi.string().default(ENV_DEFAULTS.BACKUP_CRON),

  BACKUP_TIMEZONE: Joi.string().default(ENV_DEFAULTS.BACKUP_TIMEZONE),

  BACKUP_RETENTION_DAYS: Joi.number().integer().min(1).default(ENV_DEFAULTS.BACKUP_RETENTION_DAYS),

  BACKUP_DIR: Joi.string().default(ENV_DEFAULTS.BACKUP_DIR),

  BACKUP_DRIVER: Joi.string().valid(BACKUP_DRIVER.LOCAL, BACKUP_DRIVER.S3).default(ENV_DEFAULTS.BACKUP_DRIVER),

  S3_ENDPOINT: Joi.string().when('BACKUP_DRIVER', {
    is: BACKUP_DRIVER.S3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  S3_REGION: Joi.string().when('BACKUP_DRIVER', {
    is: BACKUP_DRIVER.S3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  S3_BUCKET: Joi.string().when('BACKUP_DRIVER', {
    is: BACKUP_DRIVER.S3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  S3_ACCESS_KEY_ID: Joi.string().when('BACKUP_DRIVER', {
    is: BACKUP_DRIVER.S3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  S3_SECRET_ACCESS_KEY: Joi.string().when('BACKUP_DRIVER', {
    is: BACKUP_DRIVER.S3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  S3_PREFIX: Joi.string().allow('').default(''),
})
