import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Table } from '../../domain/entities/table.entity'
import type { ITableRepository } from '../../domain/ports/table.repository.port'
import { TableOrmEntity } from '../persistence/table.orm-entity'

@Injectable()
export class TypeormTableRepository implements ITableRepository {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly repo: Repository<TableOrmEntity>,
  ) {}

  private toDomain(row: TableOrmEntity): Table {
    return Table.create({ name: row.name, capacity: row.capacity, status: row.status }, row.id)
  }

  private toOrm(table: Table): TableOrmEntity {
    const row = new TableOrmEntity()
    row.id = table.id
    row.name = table.name
    row.capacity = table.capacity
    row.status = table.status.value
    return row
  }

  async findAll(): Promise<Table[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Table | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(table: Table): Promise<Table> {
    await this.repo.save(this.toOrm(table))
    return table
  }

  async update(table: Table): Promise<Table> {
    await this.repo.save(this.toOrm(table))
    return table
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id })
  }
}
