import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ValueObject } from '../../../../shared/domain/value-object.base'
import { TABLE_STATUS } from '../constants/table-status.constants'

export type TableStatusValue = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS]

const VALID: TableStatusValue[] = Object.values(TABLE_STATUS)

// Allowed transitions — domain invariant for the table lifecycle
const TRANSITIONS: Record<TableStatusValue, TableStatusValue[]> = {
  [TABLE_STATUS.FREE]:            [TABLE_STATUS.OCCUPIED],
  [TABLE_STATUS.OCCUPIED]:        [TABLE_STATUS.PENDING_PAYMENT],
  [TABLE_STATUS.PENDING_PAYMENT]: [TABLE_STATUS.FREE],
}

export class TableStatus extends ValueObject<{ value: TableStatusValue }> {
  static readonly FREE            = new TableStatus(TABLE_STATUS.FREE)
  static readonly OCCUPIED        = new TableStatus(TABLE_STATUS.OCCUPIED)
  static readonly PENDING_PAYMENT = new TableStatus(TABLE_STATUS.PENDING_PAYMENT)

  private constructor(value: TableStatusValue) {
    super({ value })
  }

  static of(value: string): TableStatus {
    if (!VALID.includes(value as TableStatusValue)) {
      throw new ValidationError('tableStatus', `"${value}" is not a valid table status`)
    }
    return new TableStatus(value as TableStatusValue)
  }

  get value(): TableStatusValue {
    return this.props.value
  }

  toJSON(): TableStatusValue {
    return this.props.value
  }

  transitionTo(next: TableStatus): TableStatus {
    if (!TRANSITIONS[this.value].includes(next.value)) {
      throw new ValidationError(
        'tableStatus',
        `Cannot transition from "${this.value}" to "${next.value}"`,
      )
    }
    return next
  }
}
