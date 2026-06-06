import { Injectable } from '@nestjs/common'
import { Table } from '../../domain/entities/table.entity'
import type { ITableRepository } from '../../domain/ports/table.repository.port'
import type { TableStatusValue } from '../../domain/value-objects/table-status.vo'
import { TABLE_STATUS } from '../../domain/constants/table-status.constants'

interface SeedTable {
  id: string
  name: string
  capacity: number
  status: TableStatusValue
}

const SEED: SeedTable[] = [
  { id: 'table-1', name: 'Mesa 1', capacity: 2, status: TABLE_STATUS.FREE },
  { id: 'table-2', name: 'Mesa 2', capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-3', name: 'Mesa 3', capacity: 8, status: TABLE_STATUS.PENDING_PAYMENT },
  { id: 'table-4', name: 'Mesa 4', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT },
  { id: 'table-5', name: 'Mesa 5', capacity: 2, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-6', name: 'Mesa 6', capacity: 4, status: TABLE_STATUS.OCCUPIED },
  { id: 'table-7', name: 'Mesa 7', capacity: 2, status: TABLE_STATUS.FREE },
  { id: 'table-8', name: 'Mesa 8', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT },
]

@Injectable()
export class InMemoryTableRepository implements ITableRepository {
  private readonly store: Map<string, Table>

  constructor() {
    this.store = new Map(SEED.map((t) => [t.id, Table.create(t, t.id)]))
  }

  async findAll(): Promise<Table[]> {
    return [...this.store.values()]
  }

  async findById(id: string): Promise<Table | null> {
    return this.store.get(id) ?? null
  }

  async save(table: Table): Promise<Table> {
    this.store.set(table.id, table)
    return table
  }

  async update(table: Table): Promise<Table> {
    this.store.set(table.id, table)
    return table
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
