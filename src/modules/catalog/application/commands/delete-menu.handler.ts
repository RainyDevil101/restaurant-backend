import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { DeleteMenuCommand } from './delete-menu.command'

@CommandHandler(DeleteMenuCommand)
@Injectable()
export class DeleteMenuHandler implements ICommandHandler<DeleteMenuCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  async execute({ id }: DeleteMenuCommand): Promise<void> {
    const menu = findOrThrow(await this.repo.findById(id), ENTITY_NAME.MENU, id)
    await this.repo.delete(id)
  }
}
