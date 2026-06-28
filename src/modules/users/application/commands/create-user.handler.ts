import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PASSWORD_SERVICE, type IPasswordService } from '../../../auth/domain/ports/password.service.port'
import { User } from '../../domain/entities/user.entity'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import { toUserDto, type UserDto } from '../dtos/user.dto'
import { USER_ERROR } from '../constants/user-error-messages.constants'
import { CreateUserCommand } from './create-user.command'

@CommandHandler(CreateUserCommand)
@Injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly repo: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserDto> {
    const email = dto.email.toLowerCase()
    const existing = await this.repo.findByEmail(email)
    if (existing) throw new ValidationError('email', USER_ERROR.EMAIL_EXISTS)

    const hashedCredential = await this.passwordService.hash(dto.credential)
    const user = await this.repo.save(
      User.create(
        { name: dto.name, email, hashedCredential, role: dto.role, active: true, isOwner: false },
        randomUUID(),
      ),
    )

    return toUserDto(user)
  }
}
