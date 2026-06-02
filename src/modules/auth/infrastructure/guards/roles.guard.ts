import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserRole } from '../../../users/domain/entities/user.entity'
import type { TokenPayload } from '../../domain/ports/token.service.port'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    if (!required || required.length === 0) return true

    const { user } = ctx.switchToHttp().getRequest<{ user: TokenPayload }>()
    return required.includes(user.role as UserRole)
  }
}
