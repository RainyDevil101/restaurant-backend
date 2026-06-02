import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { ITokenService, TokenPayload } from '../../domain/ports/token.service.port'

@Injectable()
export class JwtTokenAdapter implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload)
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token)
  }
}
