import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import type { Menu } from '../../domain/entities/menu.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdateMenuCommand } from './update-menu.command'

@CommandHandler(UpdateMenuCommand)
@Injectable()
export class UpdateMenuHandler implements ICommandHandler<UpdateMenuCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  async execute({ id, dto }: UpdateMenuCommand): Promise<Menu> {
    const menu = findOrThrow(await this.repo.findById(id), ENTITY_NAME.MENU, id)
    return this.repo.update(menu.update(dto))
  }
}
