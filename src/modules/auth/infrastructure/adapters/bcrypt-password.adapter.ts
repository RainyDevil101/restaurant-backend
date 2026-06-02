import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import type { IPasswordService } from '../../domain/ports/password.service.port'

@Injectable()
export class BcryptPasswordAdapter implements IPasswordService {
  private readonly ROUNDS = 12

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.ROUNDS)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
