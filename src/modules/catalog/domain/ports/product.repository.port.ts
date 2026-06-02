import type { Product } from '../entities/product.entity'

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY')

export interface ProductFilters {
  categoryId?: string
  available?: boolean
}

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  findByIds(ids: string[]): Promise<Product[]>
  save(product: Product): Promise<Product>
  update(product: Product): Promise<Product>
  delete(id: string): Promise<void>
}
