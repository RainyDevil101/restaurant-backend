import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { AREA_REPOSITORY, type IAreaRepository } from '../../domain/ports/area.repository.port'
import { DeleteAreaCommand } from './delete-area.command'

@CommandHandler(DeleteAreaCommand)
@Injectable()
export class DeleteAreaHandler implements ICommandHandler<DeleteAreaCommand> {
  constructor(@Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository) {}

  async execute({ id }: DeleteAreaCommand): Promise<void> {
    const area = await this.repo.findById(id)
    if (!area) throw new NotFoundError('Area', id)
    await this.repo.delete(id)
  }
}
