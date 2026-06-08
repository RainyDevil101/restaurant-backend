import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ENVS } from '../../../../config/env.config'
import type { TokenPayload } from '../../domain/ports/token.service.port'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ENVS.JWT_SECRET),
    })
  }

  validate(payload: TokenPayload): TokenPayload {
    return payload
  }
}
