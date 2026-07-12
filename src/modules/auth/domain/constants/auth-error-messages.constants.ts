export const AUTH_ERROR = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  ACCOUNT_LOCKED: (retryAfterSeconds: number) => {
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60))
    return `Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en ${minutes} minuto${minutes === 1 ? '' : 's'}.`
  },
} as const
