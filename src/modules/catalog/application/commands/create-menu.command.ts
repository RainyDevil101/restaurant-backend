import type { CreateMenuDto } from '../dtos/menu.dto'

export class CreateMenuCommand {
  constructor(readonly dto: CreateMenuDto) {}
}
