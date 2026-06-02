import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Menu } from '../../domain/entities/menu.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { UpdateMenuCommand } from './update-menu.command'

@CommandHandler(UpdateMenuCommand)
@Injectable()
export class UpdateMenuHandler implements ICommandHandler<UpdateMenuCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  async execute({ id, dto }: UpdateMenuCommand): Promise<Menu> {
    const menu = await this.repo.findById(id)
    if (!menu) throw new NotFoundError('Menu', id)
    return this.repo.update(menu.update(dto))
  }
}
