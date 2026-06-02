import type { TableStatusValue } from '../../domain/value-objects/table-status.vo'

export class UpdateTableStatusCommand {
  constructor(
    readonly id: string,
    readonly status: TableStatusValue,
  ) {}
}
