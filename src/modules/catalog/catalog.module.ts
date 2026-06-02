import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthModule } from '../auth/auth.module'
import { CreateCategoryHandler } from './application/commands/create-category.handler'
import { DeleteCategoryHandler } from './application/commands/delete-category.handler'
import { UpdateCategoryHandler } from './application/commands/update-category.handler'
import { CreateProductHandler } from './application/commands/create-product.handler'
import { DeleteProductHandler } from './application/commands/delete-product.handler'
import { ToggleProductAvailabilityHandler } from './application/commands/toggle-product-availability.handler'
import { UpdateProductHandler } from './application/commands/update-product.handler'
import { CreateMenuHandler } from './application/commands/create-menu.handler'
import { DeleteMenuHandler } from './application/commands/delete-menu.handler'
import { ToggleMenuActiveHandler } from './application/commands/toggle-menu-active.handler'
import { UpdateMenuHandler } from './application/commands/update-menu.handler'
import { ListCategoriesHandler } from './application/queries/list-categories.handler'
import { ListMenusHandler } from './application/queries/list-menus.handler'
import { ListProductsHandler } from './application/queries/list-products.handler'
import { CATEGORY_REPOSITORY } from './domain/ports/category.repository.port'
import { MENU_REPOSITORY } from './domain/ports/menu.repository.port'
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port'
import { CategoriesController } from './http/categories.controller'
import { MenusController } from './http/menus.controller'
import { ProductsController } from './http/products.controller'
import { InMemoryCategoryRepository } from './infrastructure/adapters/in-memory-category.repository'
import { InMemoryMenuRepository } from './infrastructure/adapters/in-memory-menu.repository'
import { InMemoryProductRepository } from './infrastructure/adapters/in-memory-product.repository'

const HANDLERS = [
  ListCategoriesHandler, CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler,
  ListProductsHandler, CreateProductHandler, UpdateProductHandler, ToggleProductAvailabilityHandler, DeleteProductHandler,
  ListMenusHandler, CreateMenuHandler, UpdateMenuHandler, ToggleMenuActiveHandler, DeleteMenuHandler,
]

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [CategoriesController, ProductsController, MenusController],
  providers: [
    ...HANDLERS,
    { provide: CATEGORY_REPOSITORY, useClass: InMemoryCategoryRepository },
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
    { provide: MENU_REPOSITORY, useClass: InMemoryMenuRepository },
  ],
  exports: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY],
})
export class CatalogModule {}
