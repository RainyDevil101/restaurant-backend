export function requiresSsl(databaseUrl: string): boolean {
  const host = new URL(databaseUrl).hostname
  return host !== 'localhost' && host !== '127.0.0.1'
}

export function sslOptionFor(databaseUrl: string): false | { rejectUnauthorized: boolean } {
  return requiresSsl(databaseUrl) ? { rejectUnauthorized: false } : false
}
