import type { ProductFilters } from '../../domain/ports/product.repository.port'

export class ListProductsQuery {
  constructor(readonly filters?: ProductFilters) {}
}
