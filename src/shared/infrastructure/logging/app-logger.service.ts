import { ConsoleLogger, Injectable } from '@nestjs/common'

@Injectable()
export class AppLogger extends ConsoleLogger {
  audit(
    userId: string,
    role: string,
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
  ): void {
    this.log(
      `[${userId}:${role}] ${method} ${path} → ${statusCode} +${durationMs}ms`,
      'Audit',
    )
  }
}
