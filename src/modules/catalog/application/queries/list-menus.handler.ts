import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Menu } from '../../domain/entities/menu.entity'
import { MENU_REPOSITORY, type IMenuRepository } from '../../domain/ports/menu.repository.port'
import { ListMenusQuery } from './list-menus.query'

@QueryHandler(ListMenusQuery)
@Injectable()
export class ListMenusHandler implements IQueryHandler<ListMenusQuery> {
  constructor(@Inject(MENU_REPOSITORY) private readonly repo: IMenuRepository) {}

  execute(): Promise<Menu[]> {
    return this.repo.findAll()
  }
}
