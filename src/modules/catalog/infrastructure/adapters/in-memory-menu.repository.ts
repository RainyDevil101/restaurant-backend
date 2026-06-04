import { Injectable } from '@nestjs/common'
import { Menu } from '../../domain/entities/menu.entity'
import type { IMenuRepository } from '../../domain/ports/menu.repository.port'

const AVAILABLE_PRODUCT_IDS = [
  'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5',
  'prod-6', 'prod-8', 'prod-9', 'prod-10', 'prod-11',
  'prod-12', 'prod-13',
]

const SEED = [
  { id: 'menu-1', name: 'Menú principal',    productIds: AVAILABLE_PRODUCT_IDS,                        active: true  },
  { id: 'menu-2', name: 'Menú de temporada', productIds: ['prod-1', 'prod-4', 'prod-8', 'prod-10'],  active: false },
]

@Injectable()
export class InMemoryMenuRepository implements IMenuRepository {
  private readonly store: Map<string, Menu>

  constructor() {
    this.store = new Map(SEED.map((m) => [m.id, Menu.create(m, m.id)]))
  }

  async findAll(): Promise<Menu[]> {
    return [...this.store.values()]
  }

  async findById(id: string): Promise<Menu | null> {
    return this.store.get(id) ?? null
  }

  async save(menu: Menu): Promise<Menu> {
    this.store.set(menu.id, menu)
    return menu
  }

  async update(menu: Menu): Promise<Menu> {
    this.store.set(menu.id, menu)
    return menu
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }

  async stamp(): Promise<{ count: number; lastModified: string | null }> {
    return { count: this.store.size, lastModified: null }
  }
}
