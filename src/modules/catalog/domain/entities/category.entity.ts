import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'

export interface CategoryProps {
  name: string
}

export class Category extends Entity {
  readonly name: string

  private constructor(props: CategoryProps, id: string) {
    super(id)
    this.name = props.name
  }

  static create(props: CategoryProps, id: string): Category {
    if (!props.name.trim()) throw new ValidationError('name', 'Category name cannot be empty')
    return new Category({ name: props.name.trim() }, id)
  }

  rename(name: string): Category {
    return Category.create({ name }, this.id)
  }
}
