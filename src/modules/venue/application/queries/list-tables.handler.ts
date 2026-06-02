import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Table } from '../../domain/entities/table.entity'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { ListTablesQuery } from './list-tables.query'

@QueryHandler(ListTablesQuery)
@Injectable()
export class ListTablesHandler implements IQueryHandler<ListTablesQuery> {
  constructor(@Inject(TABLE_REPOSITORY) private readonly repo: ITableRepository) {}

  execute({ areaId }: ListTablesQuery): Promise<Table[]> {
    return this.repo.findAll(areaId)
  }
}
