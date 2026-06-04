export const CATALOG_ENTITY_NAME = {
  CATEGORY: 'Categoría',
  MENU: 'Menú',
} as const

export const CATEGORY_ERROR = {
  HAS_PRODUCTS: 'La categoría tiene productos asociados y no puede eliminarse',
} as const

export const PRODUCT_ERROR_MSG = {
  IN_MENUS: 'El producto está incluido en uno o más menús y no puede eliminarse',
  IN_MENUS_DEACTIVATE: 'El producto está incluido en uno o más menús; quítalo del menú antes de desactivarlo',
} as const
