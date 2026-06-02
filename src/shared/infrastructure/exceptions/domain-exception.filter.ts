import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { DomainError } from '../../domain/errors/domain.error'
import { AppLogger } from '../logging/app-logger.service'

export interface ErrorResponseBody {
  statusCode: number
  error: string
  message: string | string[]
  timestamp: string
  path: string
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<Request>()
    const res = ctx.getResponse<Response>()

    const { status, error, message } = this.resolve(exception)

    const body: ErrorResponseBody = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    }

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} [${status}]: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : String(exception),
        DomainExceptionFilter.name,
      )
    } else {
      this.logger.warn(
        `${req.method} ${req.url} [${status}]: ${JSON.stringify(message)}`,
        DomainExceptionFilter.name,
      )
    }

    res.status(status).json(body)
  }

  private resolve(exception: unknown): {
    status: number
    error: string
    message: string | string[]
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const raw    = exception.getResponse()
      const message =
        typeof raw === 'string'
          ? raw
          : ((raw as Record<string, unknown>).message as string | string[]) ??
            exception.message
      return { status, error: HttpStatus[status] ?? 'HTTP_EXCEPTION', message }
    }

    if (exception instanceof DomainError) {
      return { status: exception.httpStatus, error: exception.name, message: exception.message }
    }

    const isDev = process.env.NODE_ENV !== 'production'
    return {
      status: 500,
      error: 'InternalServerError',
      message: isDev && exception instanceof Error ? exception.message : 'Internal server error',
    }
  }
}
