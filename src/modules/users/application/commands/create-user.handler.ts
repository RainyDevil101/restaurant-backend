import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PASSWORD_SERVICE, type IPasswordService } from '../../../auth/domain/ports/password.service.port'
import { User } from '../../domain/entities/user.entity'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import type { UserDto } from '../dtos/user.dto'
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
    if (existing) throw new ValidationError('email', 'A user with this email already exists')

    const hashedCredential = await this.passwordService.hash(dto.credential)
    const user = await this.repo.save(
      User.create({ name: dto.name, email, hashedCredential, role: dto.role, active: true }, randomUUID()),
    )

    return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active }
  }
}
