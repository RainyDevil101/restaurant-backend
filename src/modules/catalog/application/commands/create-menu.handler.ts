import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { Menu } from '../../domain/entities/menu.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { CreateMenuCommand } from './create-menu.command'

@CommandHandler(CreateMenuCommand)
@Injectable()
export class CreateMenuHandler implements ICommandHandler<CreateMenuCommand> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  execute({ dto }: CreateMenuCommand): Promise<Menu> {
    return this.repo.save(Menu.create({ ...dto, active: false }, randomUUID()))
  }
}
