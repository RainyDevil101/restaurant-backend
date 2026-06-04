import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { CATEGORY_VALIDATION } from '../constants/catalog-validation-messages.constants'

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
    if (!props.name.trim()) throw new ValidationError('name', CATEGORY_VALIDATION.NAME_EMPTY)
    return new Category({ name: props.name.trim() }, id)
  }

  rename(name: string): Category {
    return Category.create({ name }, this.id)
  }
}
