import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../domain/ports/category.repository.port'
import { DeleteCategoryCommand } from './delete-category.command'

@CommandHandler(DeleteCategoryCommand)
@Injectable()
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly repo: ICategoryRepository) {}

  async execute({ id }: DeleteCategoryCommand): Promise<void> {
    const category = await this.repo.findById(id)
    if (!category) throw new NotFoundError('Category', id)
    await this.repo.delete(id)
  }
}
