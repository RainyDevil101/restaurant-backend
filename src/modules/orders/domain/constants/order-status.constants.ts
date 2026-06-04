export const ORDER_STATUS = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_proceso',
  READY: 'listo',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
} as const

export const ORDER_STATUS_VALIDATION = {
  INVALID_VALUE: (value: string) => `"${value}" no es un estado de pedido válido`,
  INVALID_TRANSITION: (from: string, to: string) => `No se puede pasar de "${from}" a "${to}"`,
} as const
