import Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3001),

  CORS_ORIGIN: Joi.string()
    .default('http://localhost:5173')
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
    .default('7d')
    .messages({
      'string.pattern.base': 'JWT_EXPIRES_IN must be a duration like 60s, 15m, 7d, or 1h',
    }),

  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
  }),

  THROTTLE_TTL: Joi.number().integer().min(1000).default(60000),

  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),
})
