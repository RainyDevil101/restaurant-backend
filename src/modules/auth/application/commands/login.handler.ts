import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { USER_REPOSITORY, type IUserRepository } from '../../../users/domain/ports/user.repository.port'
import type { User } from '../../../users/domain/entities/user.entity'
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error'
import { AccountLockedError } from '../../domain/errors/account-locked.error'
import { LOCKOUT_POLICY } from '../../domain/constants/lockout.constants'
import { PASSWORD_SERVICE, type IPasswordService } from '../../domain/ports/password.service.port'
import { TOKEN_SERVICE, type ITokenService } from '../../domain/ports/token.service.port'
import { AuthTokenDto } from '../dtos/auth-token.dto'
import { toUserDto } from '../../../users/application/dtos/user.dto'
import { LoginCommand } from './login.command'

@CommandHandler(LoginCommand)
@Injectable()
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)   private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_SERVICE)  private readonly passwordService: IPasswordService,
    @Inject(TOKEN_SERVICE)     private readonly tokenService: ITokenService,
  ) {}

  async execute({ dto }: LoginCommand): Promise<AuthTokenDto> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase())
    if (!user || !user.active) throw new InvalidCredentialsError()

    const now = new Date()
    if (user.isLocked(now)) {
      throw new AccountLockedError(this.retryAfterSeconds(user, now))
    }

    const valid = await this.passwordService.compare(dto.credential, user.hashedCredential)
    if (!valid) {
      const updated = user.registerFailedAttempt(
        now,
        LOCKOUT_POLICY.FREE_ATTEMPTS,
        LOCKOUT_POLICY.BACKOFF_SECONDS,
      )
      await this.userRepo.update(updated)
      if (updated.isLocked(now)) {
        throw new AccountLockedError(this.retryAfterSeconds(updated, now))
      }
      throw new InvalidCredentialsError()
    }

    if (user.failedAttempts > 0 || user.lockedUntil !== null) {
      await this.userRepo.update(user.registerSuccessfulLogin())
    }

    const token = this.tokenService.sign({ sub: user.id, email: user.email, role: user.role })
    return new AuthTokenDto(token, toUserDto(user))
  }

  private retryAfterSeconds(user: User, now: Date): number {
    if (user.lockedUntil === null) return 0
    return Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000)
  }
}
