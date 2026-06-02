import type { UpdateMenuDto } from '../dtos/menu.dto'

export class UpdateMenuCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateMenuDto,
  ) {}
}
