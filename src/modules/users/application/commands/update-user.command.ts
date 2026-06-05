import type { UpdateUserDto } from '../dtos/update-user.dto'

export class UpdateUserCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateUserDto,
    readonly actorId: string,
  ) {}
}
