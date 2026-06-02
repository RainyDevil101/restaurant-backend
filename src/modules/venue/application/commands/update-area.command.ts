import type { UpdateAreaDto } from '../dtos/area.dto'

export class UpdateAreaCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateAreaDto,
  ) {}
}
