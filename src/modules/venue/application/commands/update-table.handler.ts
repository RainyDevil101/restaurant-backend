import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Table } from '../../domain/entities/table.entity'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdateTableCommand } from './update-table.command'

@CommandHandler(UpdateTableCommand)
@Injectable()
export class UpdateTableHandler implements ICommandHandler<UpdateTableCommand> {
  constructor(@Inject(TABLE_REPOSITORY) private readonly repo: ITableRepository) {}

  async execute({ id, dto }: UpdateTableCommand): Promise<Table> {
    const table = await this.repo.findById(id)
    if (!table) throw new NotFoundError(ENTITY_NAME.TABLE, id)
    return this.repo.update(table.update(dto))
  }
}
