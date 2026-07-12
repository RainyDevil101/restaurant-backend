export const LOCKOUT_POLICY = {
  FREE_ATTEMPTS: 3,
  BACKOFF_SECONDS: [15, 30, 60, 120],
} as const
