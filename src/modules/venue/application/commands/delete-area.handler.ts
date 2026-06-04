import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { DeleteAreaCommand } from './delete-area.command'

@CommandHandler(DeleteAreaCommand)
@Injectable()
export class DeleteAreaHandler implements ICommandHandler<DeleteAreaCommand> {
  constructor(
    @Inject(AREA_REPOSITORY) private readonly areas: IAreaRepository,
    @Inject(TABLE_REPOSITORY) private readonly tables: ITableRepository,
  ) {}

  async execute({ id }: DeleteAreaCommand): Promise<void> {
    const area = await this.areas.findById(id)
    if (!area) throw new NotFoundError('Area', id)

    const associated = await this.tables.findAll(id)
    if (associated.length > 0) {
      throw new ValidationError('area', 'tiene mesas asociadas y no puede eliminarse')
    }

    await this.areas.delete(id)
  }
}
