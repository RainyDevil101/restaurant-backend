export const ITEM_KIND = {
  PRODUCT: 'product',
  COMBO: 'combo',
} as const

export type ItemKind = (typeof ITEM_KIND)[keyof typeof ITEM_KIND]
