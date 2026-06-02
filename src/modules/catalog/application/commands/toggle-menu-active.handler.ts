import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Menu } from '../../domain/entities/menu.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { ToggleMenuActiveCommand } from './toggle-menu-active.command'

@CommandHandler(ToggleMenuActiveCommand)
@Injectable()
export class ToggleMenuActiveHandler implements ICommandHandler<ToggleMenuActiveCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  async execute({ id }: ToggleMenuActiveCommand): Promise<Menu> {
    const menu = await this.repo.findById(id)
    if (!menu) throw new NotFoundError('Menu', id)
    return this.repo.update(menu.toggleActive())
  }
}
