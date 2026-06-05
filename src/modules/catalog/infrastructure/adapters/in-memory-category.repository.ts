import { Injectable } from '@nestjs/common'
import { Category } from '../../domain/entities/category.entity'
import type { ICategoryRepository } from '../../domain/ports/category.repository.port'

const SEED = [
  { id: 'cat-1', name: 'Entradas', areaId: 'area-1' },
  { id: 'cat-2', name: 'Platos fuertes', areaId: 'area-1' },
  { id: 'cat-3', name: 'Bebidas', areaId: 'area-2' },
  { id: 'cat-4', name: 'Postres', areaId: 'area-1' },
]

@Injectable()
export class InMemoryCategoryRepository implements ICategoryRepository {
  private readonly store: Map<string, Category>

  constructor() {
    this.store = new Map(SEED.map((c) => [c.id, Category.create(c, c.id)]))
  }

  async findAll(): Promise<Category[]> {
    return [...this.store.values()]
  }

  async findById(id: string): Promise<Category | null> {
    return this.store.get(id) ?? null
  }

  async save(category: Category): Promise<Category> {
    this.store.set(category.id, category)
    return category
  }

  async update(category: Category): Promise<Category> {
    this.store.set(category.id, category)
    return category
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }

  async stamp(): Promise<{ count: number; lastModified: string | null }> {
    return { count: this.store.size, lastModified: null }
  }
}
