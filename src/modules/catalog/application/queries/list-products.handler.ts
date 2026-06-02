import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Product } from '../../domain/entities/product.entity'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { ListProductsQuery } from './list-products.query'

@QueryHandler(ListProductsQuery)
@Injectable()
export class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  execute({ filters }: ListProductsQuery): Promise<Product[]> {
    return this.repo.findAll(filters)
  }
}
