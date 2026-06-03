import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

export function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
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
