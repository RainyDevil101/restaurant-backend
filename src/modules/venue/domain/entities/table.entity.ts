import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { definedFields } from '../../../../shared/domain/patch'
import { TableStatus, type TableStatusValue } from '../value-objects/table-status.vo'

export interface TableProps {
  name: string
  capacity: number
  status: TableStatusValue
  areaId: string
}

export class Table extends Entity {
  readonly name: string
  readonly capacity: number
  readonly status: TableStatus
  readonly areaId: string

  private constructor(props: TableProps, id: string) {
    super(id)
    this.name = props.name
    this.capacity = props.capacity
    this.status = TableStatus.of(props.status)
    this.areaId = props.areaId
  }

  static create(props: TableProps, id: string): Table {
    if (!props.name.trim()) throw new ValidationError('name', 'Table name cannot be empty')
    if (props.capacity < 1) throw new ValidationError('capacity', 'Capacity must be at least 1')
    return new Table({ ...props, name: props.name.trim() }, id)
  }

  updateStatus(next: TableStatusValue): Table {
    const nextStatus = TableStatus.of(next)
    this.status.transitionTo(nextStatus) // throws ValidationError if invalid
    return Table.create({ ...this.toProps(), status: nextStatus.value }, this.id)
  }

  update(patch: Partial<Pick<TableProps, 'name' | 'capacity' | 'areaId'>>): Table {
    return Table.create({ ...this.toProps(), ...definedFields(patch) }, this.id)
  }

  private toProps(): TableProps {
    return {
      name: this.name,
      capacity: this.capacity,
      status: this.status.value,
      areaId: this.areaId,
    }
  }
}
