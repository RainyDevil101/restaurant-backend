import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { DeleteMenuCommand } from './delete-menu.command'

@CommandHandler(DeleteMenuCommand)
@Injectable()
export class DeleteMenuHandler implements ICommandHandler<DeleteMenuCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  async execute({ id }: DeleteMenuCommand): Promise<void> {
    const menu = await this.repo.findById(id)
    if (!menu) throw new NotFoundError('Menu', id)
    await this.repo.delete(id)
  }
}
