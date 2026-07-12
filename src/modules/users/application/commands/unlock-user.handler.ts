import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import { toUserDto, type UserDto } from '../dtos/user.dto'
import { UnlockUserCommand } from './unlock-user.command'

@CommandHandler(UnlockUserCommand)
@Injectable()
export class UnlockUserHandler implements ICommandHandler<UnlockUserCommand> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  async execute({ id }: UnlockUserCommand): Promise<UserDto> {
    const user = findOrThrow(await this.repo.findById(id), ENTITY_NAME.USER, id)
    const unlocked = await this.repo.update(user.unlock())
    return toUserDto(unlocked)
  }
}
