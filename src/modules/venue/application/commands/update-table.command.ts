import type { UpdateTableDto } from '../dtos/table.dto'

export class UpdateTableCommand {
  constructor(
    readonly id: string,
    readonly dto: UpdateTableDto,
  ) {}
}
