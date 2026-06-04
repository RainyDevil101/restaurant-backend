import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Category } from '../../domain/entities/category.entity'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { CATALOG_ENTITY_NAME } from '../constants/catalog-error-messages.constants'
import { UpdateCategoryCommand } from './update-category.command'

@CommandHandler(UpdateCategoryCommand)
@Injectable()
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly repo: ICategoryRepository) {}

  async execute({ id, dto }: UpdateCategoryCommand): Promise<Category> {
    const category = await this.repo.findById(id)
    if (!category) throw new NotFoundError(CATALOG_ENTITY_NAME.CATEGORY, id)
    return this.repo.update(dto.name ? category.rename(dto.name) : category)
  }
}
