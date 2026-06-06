import type { Table } from '../entities/table.entity'

export const TABLE_REPOSITORY = Symbol('TABLE_REPOSITORY')

export interface ITableRepository {
  findAll(): Promise<Table[]>
  findById(id: string): Promise<Table | null>
  save(table: Table): Promise<Table>
  update(table: Table): Promise<Table>
  delete(id: string): Promise<void>
}
