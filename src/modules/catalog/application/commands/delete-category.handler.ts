import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../domain/ports/product.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { CATEGORY_ERROR } from '../constants/catalog-error-messages.constants'
import { DeleteCategoryCommand } from './delete-category.command'

@CommandHandler(DeleteCategoryCommand)
@Injectable()
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categories: ICategoryRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
  ) {}

  async execute({ id }: DeleteCategoryCommand): Promise<void> {
    const category = findOrThrow(await this.categories.findById(id), ENTITY_NAME.CATEGORY, id)

    const associated = await this.products.findAll({ categoryId: id })
    if (associated.length > 0) {
      throw new ValidationError('category', CATEGORY_ERROR.HAS_PRODUCTS)
    }

    await this.categories.delete(id)
  }
}
