import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { Area } from '../../domain/entities/area.entity'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { CreateAreaCommand } from './create-area.command'

@CommandHandler(CreateAreaCommand)
@Injectable()
export class CreateAreaHandler implements ICommandHandler<CreateAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository) {}

  execute({ dto }: CreateAreaCommand): Promise<Area> {
    return this.repo.save(Area.create({ name: dto.name }, randomUUID()))
  }
}
