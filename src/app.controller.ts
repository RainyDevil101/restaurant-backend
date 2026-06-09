import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class AppController {
  private readonly startedAt = Date.now()

  @Get()
  health() {
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
    }
  }
}
