export const PRODUCT_VALIDATION = {
  notAvailable: (name: string) => `"${name}" no está disponible`,
} as const

export const ITEM_VALIDATION = {
  EXACTLY_ONE_REFERENCE: 'Cada artículo debe tener exactamente uno de productId o menuId',
} as const
