import type { CreateAreaDto } from '../dtos/area.dto'

export class CreateAreaCommand {
  constructor(readonly dto: CreateAreaDto) {}
}
