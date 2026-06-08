import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ENVS } from './env.config'

export function corsOrigins(): string[] {
  const raw = process.env[ENVS.CORS_ORIGIN] ?? ''
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
