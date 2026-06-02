import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'

export interface AreaProps {
  name: string
}

export class Area extends Entity {
  readonly name: string

  private constructor(props: AreaProps, id: string) {
    super(id)
    this.name = props.name
  }

  static create(props: AreaProps, id: string): Area {
    if (!props.name.trim()) throw new ValidationError('name', 'Area name cannot be empty')
    return new Area({ name: props.name.trim() }, id)
  }

  rename(name: string): Area {
    return Area.create({ name }, this.id)
  }
}
