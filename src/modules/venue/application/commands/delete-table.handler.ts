import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { TABLE_REPOSITORY, type ITableRepository } from '../../domain/ports/table.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { DeleteTableCommand } from './delete-table.command'

@CommandHandler(DeleteTableCommand)
@Injectable()
export class DeleteTableHandler implements ICommandHandler<DeleteTableCommand> {
  constructor(@Inject(TABLE_REPOSITORY) private readonly repo: ITableRepository) {}

  async execute({ id }: DeleteTableCommand): Promise<void> {
    findOrThrow(await this.repo.findById(id), ENTITY_NAME.TABLE, id)
    await this.repo.delete(id)
  }
}
