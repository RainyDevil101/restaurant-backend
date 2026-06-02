import { Injectable } from '@nestjs/common'
import { Area } from '../../domain/entities/area.entity'
import type { IAreaRepository } from '../../domain/ports/area.repository.port'

const SEED = [
  { id: 'area-1', name: 'Terraza' },
  { id: 'area-2', name: 'Interior' },
]

@Injectable()
export class InMemoryAreaRepository implements IAreaRepository {
  private readonly store: Map<string, Area>

  constructor() {
    this.store = new Map(SEED.map((a) => [a.id, Area.create(a, a.id)]))
  }

  async findAll(): Promise<Area[]> {
    return [...this.store.values()]
  }

  async findById(id: string): Promise<Area | null> {
    return this.store.get(id) ?? null
  }

  async save(area: Area): Promise<Area> {
    this.store.set(area.id, area)
    return area
  }

  async update(area: Area): Promise<Area> {
    this.store.set(area.id, area)
    return area
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
