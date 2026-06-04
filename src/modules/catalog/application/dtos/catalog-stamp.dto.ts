export interface ResourceStamp {
  count: number
  lastModified: string | null
}

export interface CatalogStampDto {
  products: ResourceStamp
  categories: ResourceStamp
  menus: ResourceStamp
}
