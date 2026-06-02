import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Area } from '../../domain/entities/area.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { UpdateAreaCommand } from './update-area.command'

@CommandHandler(UpdateAreaCommand)
@Injectable()
export class UpdateAreaHandler implements ICommandHandler<UpdateAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository) {}

  async execute({ id, dto }: UpdateAreaCommand): Promise<Area> {
    const area = await this.repo.findById(id)
    if (!area) throw new NotFoundError('Area', id)
    return this.repo.update(dto.name ? area.rename(dto.name) : area)
  }
}
