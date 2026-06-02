import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import { type Observable, tap } from 'rxjs'
import type { TokenPayload } from '../../../modules/auth/domain/ports/token.service.port'
import { AppLogger } from './app-logger.service'

interface RequestWithUser {
  method: string
  url: string
  user?: TokenPayload
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>()
    const { method, url, user } = req
    const userId = user?.sub ?? 'anonymous'
    const role   = user?.role ?? '-'
    const start  = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const res = ctx.switchToHttp().getResponse<{ statusCode: number }>()
          this.logger.audit(userId, role, method, url, res.statusCode, Date.now() - start)
        },
        error: (err: Error) => {
          this.logger.warn(
            `[${userId}:${role}] ${method} ${url} → EXCEPTION +${Date.now() - start}ms | ${err.message}`,
            'Audit',
          )
        },
      }),
    )
  }
}
