import type { CreateUserDto } from '../dtos/create-user.dto'

export class CreateUserCommand {
  constructor(readonly dto: CreateUserDto) {}
}
