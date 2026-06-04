import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import { USER_ENTITY_NAME } from '../constants/user-error-messages.constants'
import { DeactivateUserCommand } from './deactivate-user.command'

@CommandHandler(DeactivateUserCommand)
@Injectable()
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  async execute({ id }: DeactivateUserCommand): Promise<void> {
    const user = await this.repo.findById(id)
    if (!user) throw new NotFoundError(USER_ENTITY_NAME, id)
    await this.repo.update(user.deactivate())
  }
}
