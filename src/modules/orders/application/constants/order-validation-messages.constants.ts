export const PRODUCT_VALIDATION = {
  notAvailable: (name: string) => `El producto "${name}" no está disponible`,
} as const

export const ITEM_VALIDATION = {
  EXACTLY_ONE_REFERENCE: 'Cada ítem debe ser un producto o un combo',
} as const
