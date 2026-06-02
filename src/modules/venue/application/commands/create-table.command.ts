import type { CreateTableDto } from '../dtos/table.dto'

export class CreateTableCommand {
  constructor(readonly dto: CreateTableDto) {}
}
