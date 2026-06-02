import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { Category } from '../../domain/entities/category.entity'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { CreateCategoryCommand } from './create-category.command'

@CommandHandler(CreateCategoryCommand)
@Injectable()
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly repo: ICategoryRepository) {}

  execute({ dto }: CreateCategoryCommand): Promise<Category> {
    return this.repo.save(Category.create({ name: dto.name }, randomUUID()))
  }
}
