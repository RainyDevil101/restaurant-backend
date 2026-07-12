import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ForbiddenError } from '../../../../shared/domain/errors/forbidden.error'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { PASSWORD_SERVICE, type IPasswordService } from '../../../auth/domain/ports/password.service.port'
import { User, type UserProps } from '../../domain/entities/user.entity'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import { type UserDto, toUserDto } from '../dtos/user.dto'
import { USER_ERROR } from '../constants/user-error-messages.constants'
import { UpdateUserCommand } from './update-user.command'

@CommandHandler(UpdateUserCommand)
@Injectable()
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly repo: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute({ id, dto, actorId }: UpdateUserCommand): Promise<UserDto> {
    const current = findOrThrow(await this.repo.findById(id), ENTITY_NAME.USER, id)

    if (current.isOwner && actorId !== current.id) {
      throw new ForbiddenError(USER_ERROR.CANNOT_MODIFY_OWNER)
    }
    if (dto.active === false && actorId === current.id) {
      throw new ForbiddenError(USER_ERROR.CANNOT_DEACTIVATE_SELF)
    }

    const nextProps: UserProps = {
      name: dto.name ?? current.name,
      email: current.email,
      hashedCredential: current.hashedCredential,
      role: dto.role ?? current.role,
      active: dto.active ?? current.active,
      isOwner: current.isOwner,
      failedAttempts: current.failedAttempts,
      lockedUntil: current.lockedUntil,
    }

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase()
      const owner = await this.repo.findByEmail(email)
      if (owner && owner.id !== id) {
        throw new ValidationError('email', USER_ERROR.EMAIL_EXISTS)
      }
      nextProps.email = email
    }

    if (dto.credential !== undefined && dto.credential.length > 0) {
      nextProps.hashedCredential = await this.passwordService.hash(dto.credential)
    }

    const user = await this.repo.update(User.create(nextProps, id))
    return toUserDto(user)
  }
}
