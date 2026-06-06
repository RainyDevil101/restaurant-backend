import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { Table } from '../../domain/entities/table.entity'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { TABLE_STATUS } from '../../domain/constants/table-status.constants'
import { CreateTableCommand } from './create-table.command'

@CommandHandler(CreateTableCommand)
@Injectable()
export class CreateTableHandler implements ICommandHandler<CreateTableCommand> {
  constructor(@Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository) {}

  async execute({ dto }: CreateTableCommand): Promise<Table> {
    return this.tableRepo.save(
      Table.create(
        { name: dto.name, capacity: dto.capacity, status: TABLE_STATUS.FREE },
        randomUUID(),
      ),
    )
  }
}
