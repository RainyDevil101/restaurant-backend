import type { LoginDto } from '../dtos/login.dto'

export class LoginCommand {
  constructor(readonly dto: LoginDto) {}
}
