import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { TokenPayload } from '../../domain/ports/token.service.port'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    return ctx.switchToHttp().getRequest<{ user: TokenPayload }>().user
  },
)
