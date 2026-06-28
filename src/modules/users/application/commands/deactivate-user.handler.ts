import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ForbiddenError } from '../../../../shared/domain/errors/forbidden.error'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import { USER_ERROR } from '../constants/user-error-messages.constants'
import { DeactivateUserCommand } from './deactivate-user.command'

@CommandHandler(DeactivateUserCommand)
@Injectable()
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  async execute({ id, actorId }: DeactivateUserCommand): Promise<void> {
    const user = findOrThrow(await this.repo.findById(id), ENTITY_NAME.USER, id)
    if (actorId === user.id) throw new ForbiddenError(USER_ERROR.CANNOT_DEACTIVATE_SELF)
    if (user.isOwner) throw new ForbiddenError(USER_ERROR.CANNOT_MODIFY_OWNER)
    await this.repo.update(user.deactivate())
  }
}
