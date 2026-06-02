import type { Menu } from '../entities/menu.entity'

export const MENU_REPOSITORY = Symbol('MENU_REPOSITORY')

export interface IMenuRepository {
  findAll(): Promise<Menu[]>
  findById(id: string): Promise<Menu | null>
  save(menu: Menu): Promise<Menu>
  update(menu: Menu): Promise<Menu>
  delete(id: string): Promise<void>
}
