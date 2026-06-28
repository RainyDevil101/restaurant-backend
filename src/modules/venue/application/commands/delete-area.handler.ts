import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { DeleteAreaCommand } from './delete-area.command'

@CommandHandler(DeleteAreaCommand)
@Injectable()
export class DeleteAreaHandler implements ICommandHandler<DeleteAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly areas: IAreaRepository) {}

  async execute({ id }: DeleteAreaCommand): Promise<void> {
    findOrThrow(await this.areas.findById(id), ENTITY_NAME.AREA, id)

    await this.areas.delete(id)
  }
}
