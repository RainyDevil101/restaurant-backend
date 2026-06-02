import type { Area } from '../entities/area.entity'

export const AREA_REPOSITORY = Symbol('AREA_REPOSITORY')

export interface IAreaRepository {
  findAll(): Promise<Area[]>
  findById(id: string): Promise<Area | null>
  save(area: Area): Promise<Area>
  update(area: Area): Promise<Area>
  delete(id: string): Promise<void>
}
