import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Throttle } from '@nestjs/throttler'
import { ENV_DEFAULTS } from '../../../shared/constants/env-defaults.constants'
import { LoginCommand } from '../application/commands/login.command'
import { LoginDto } from '../application/dtos/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: ENV_DEFAULTS.AUTH_THROTTLE_TTL, limit: ENV_DEFAULTS.AUTH_THROTTLE_LIMIT } })
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto))
  }
}
