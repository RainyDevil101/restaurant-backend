import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ENV_DEFAULTS } from '../../shared/constants/env-defaults.constants'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { LoginHandler } from './application/commands/login.handler'
import { PASSWORD_SERVICE } from './domain/ports/password.service.port'
import { TOKEN_SERVICE } from './domain/ports/token.service.port'
import { AuthController } from './http/auth.controller'
import { BcryptPasswordAdapter } from './infrastructure/adapters/bcrypt-password.adapter'
import { JwtTokenAdapter } from './infrastructure/adapters/jwt-token.adapter'
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from './infrastructure/guards/roles.guard'
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy'

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? ENV_DEFAULTS.JWT_EXPIRES_IN },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    { provide: PASSWORD_SERVICE, useClass: BcryptPasswordAdapter },
    { provide: TOKEN_SERVICE, useClass: JwtTokenAdapter },
  ],
  exports: [JwtAuthGuard, RolesGuard, PASSWORD_SERVICE],
})
export class AuthModule {}
