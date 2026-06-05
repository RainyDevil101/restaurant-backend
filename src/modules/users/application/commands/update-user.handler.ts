import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ForbiddenError } from '../../../../shared/domain/errors/forbidden.error'
import { PASSWORD_SERVICE, type IPasswordService } from '../../../auth/domain/ports/password.service.port'
import { User, type UserProps } from '../../domain/entities/user.entity'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import type { UserDto } from '../dtos/user.dto'
import { USER_ENTITY_NAME, USER_ERROR } from '../constants/user-error-messages.constants'
import { UpdateUserCommand } from './update-user.command'

@CommandHandler(UpdateUserCommand)
@Injectable()
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly repo: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute({ id, dto, actorId }: UpdateUserCommand): Promise<UserDto> {
    const current = await this.repo.findById(id)
    if (!current) throw new NotFoundError(USER_ENTITY_NAME, id)

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
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      isOwner: user.isOwner,
    }
  }
}
