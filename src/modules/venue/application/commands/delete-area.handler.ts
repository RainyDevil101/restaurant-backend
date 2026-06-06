import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { VENUE_ENTITY_NAME } from '../constants/venue-error-messages.constants'
import { DeleteAreaCommand } from './delete-area.command'

@CommandHandler(DeleteAreaCommand)
@Injectable()
export class DeleteAreaHandler implements ICommandHandler<DeleteAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly areas: IAreaRepository) {}

  async execute({ id }: DeleteAreaCommand): Promise<void> {
    const area = await this.areas.findById(id)
    if (!area) throw new NotFoundError(VENUE_ENTITY_NAME.AREA, id)

    await this.areas.delete(id)
  }
}
