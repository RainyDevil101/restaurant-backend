import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import type { Area } from '../../domain/entities/area.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdateAreaCommand } from './update-area.command'

@CommandHandler(UpdateAreaCommand)
@Injectable()
export class UpdateAreaHandler implements ICommandHandler<UpdateAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository) {}

  async execute({ id, dto }: UpdateAreaCommand): Promise<Area> {
    const area = findOrThrow(await this.repo.findById(id), ENTITY_NAME.AREA, id)
    return this.repo.update(dto.name ? area.rename(dto.name) : area)
  }
}
