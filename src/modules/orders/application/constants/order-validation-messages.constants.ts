export const PRODUCT_VALIDATION = {
  notAvailable: (name: string) => `El producto "${name}" no está disponible`,
} as const

export const ITEM_VALIDATION = {
  EXACTLY_ONE_REFERENCE: 'Cada ítem debe ser un producto o un combo',
} as const

export const COMANDA_VALIDATION = {
  NO_ACTIVE_ORDERS: 'No hay pedidos activos en la mesa para imprimir la comanda',
} as const
