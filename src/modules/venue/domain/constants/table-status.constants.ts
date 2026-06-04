export const TABLE_STATUS = {
  FREE: 'libre',
  OCCUPIED: 'ocupada',
  PENDING_PAYMENT: 'por_cobrar',
} as const

export const TABLE_STATUS_VALIDATION = {
  INVALID_VALUE: (value: string) => `"${value}" no es un estado de mesa válido`,
  INVALID_TRANSITION: (from: string, to: string) => `No se puede pasar de "${from}" a "${to}"`,
} as const
