import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import type { CatalogStampDto } from '../dtos/catalog-stamp.dto'
import { GetCatalogStampQuery } from './get-catalog-stamp.query'

@QueryHandler(GetCatalogStampQuery)
@Injectable()
export class GetCatalogStampHandler implements IQueryHandler<GetCatalogStampQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository,
    @Inject(MENU_REPOSITORY) private readonly menus: IMenuRepository,
  ) {}

  async execute(): Promise<CatalogStampDto> {
    const [products, categories, menus] = await Promise.all([
      this.products.stamp(),
      this.categories.stamp(),
      this.menus.stamp(),
    ])
    return { products, categories, menus }
  }
}
