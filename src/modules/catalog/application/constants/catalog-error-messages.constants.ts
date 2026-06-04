export const CATALOG_ENTITY_NAME = {
  CATEGORY: 'Category',
  MENU: 'Menu',
} as const

export const CATEGORY_ERROR = {
  HAS_PRODUCTS: 'tiene productos asociados y no puede eliminarse',
} as const

export const PRODUCT_ERROR_MSG = {
  IN_MENUS: 'está incluido en uno o más menús y no puede eliminarse',
} as const
