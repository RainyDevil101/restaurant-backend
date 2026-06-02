import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { Table } from '../../domain/entities/table.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { TABLE_STATUS } from '../../domain/constants/table-status.constants'
import { CreateTableCommand } from './create-table.command'

@CommandHandler(CreateTableCommand)
@Injectable()
export class CreateTableHandler implements ICommandHandler<CreateTableCommand> {
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(AREA_REPOSITORY)  private readonly areaRepo: IAreaRepository,
  ) {}

  async execute({ dto }: CreateTableCommand): Promise<Table> {
    const area = await this.areaRepo.findById(dto.areaId)
    if (!area) throw new NotFoundError('Area', dto.areaId)

    return this.tableRepo.save(
      Table.create(
        { name: dto.name, capacity: dto.capacity, status: TABLE_STATUS.FREE, areaId: dto.areaId },
        randomUUID(),
      ),
    )
  }
}
