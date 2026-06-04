import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ENV_DEFAULTS } from '../shared/constants/env-defaults.constants'

export function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? ENV_DEFAULTS.CORS_ORIGIN
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function buildCorsOptions(): CorsOptions {
  return {
    origin: corsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }
}
