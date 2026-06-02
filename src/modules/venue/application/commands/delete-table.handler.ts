import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { DeleteTableCommand } from './delete-table.command'

@CommandHandler(DeleteTableCommand)
@Injectable()
export class DeleteTableHandler implements ICommandHandler<DeleteTableCommand> {
  constructor(@Inject(TABLE_REPOSITORY) private readonly repo: ITableRepository) {}

  async execute({ id }: DeleteTableCommand): Promise<void> {
    const table = await this.repo.findById(id)
    if (!table) throw new NotFoundError('Table', id)
    await this.repo.delete(id)
  }
}
