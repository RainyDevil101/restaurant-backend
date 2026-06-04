import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
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
import { GetCatalogStampHandler } from './application/queries/get-catalog-stamp.handler'
import { ListCategoriesHandler } from './application/queries/list-categories.handler'
import { ListMenusHandler } from './application/queries/list-menus.handler'
import { ListProductsHandler } from './application/queries/list-products.handler'
import { CATEGORY_REPOSITORY } from './domain/ports/category.repository.port'
import { MENU_REPOSITORY } from './domain/ports/menu.repository.port'
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port'
import { CatalogController } from './http/catalog.controller'
import { CategoriesController } from './http/categories.controller'
import { MenusController } from './http/menus.controller'
import { ProductsController } from './http/products.controller'
import { TypeormCategoryRepository } from './infrastructure/adapters/typeorm-category.repository'
import { TypeormMenuRepository } from './infrastructure/adapters/typeorm-menu.repository'
import { TypeormProductRepository } from './infrastructure/adapters/typeorm-product.repository'
import { CategoryOrmEntity } from './infrastructure/persistence/category.orm-entity'
import { MenuOrmEntity } from './infrastructure/persistence/menu.orm-entity'
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity'

const HANDLERS = [
  GetCatalogStampHandler,
  ListCategoriesHandler, CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler,
  ListProductsHandler, CreateProductHandler, UpdateProductHandler, ToggleProductAvailabilityHandler, DeleteProductHandler,
  ListMenusHandler, CreateMenuHandler, UpdateMenuHandler, ToggleMenuActiveHandler, DeleteMenuHandler,
]

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    TypeOrmModule.forFeature([CategoryOrmEntity, ProductOrmEntity, MenuOrmEntity]),
  ],
  controllers: [CatalogController, CategoriesController, ProductsController, MenusController],
  providers: [
    ...HANDLERS,
    { provide: CATEGORY_REPOSITORY, useClass: TypeormCategoryRepository },
    { provide: PRODUCT_REPOSITORY, useClass: TypeormProductRepository },
    { provide: MENU_REPOSITORY, useClass: TypeormMenuRepository },
  ],
  exports: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY],
})
export class CatalogModule {}
