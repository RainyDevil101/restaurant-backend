import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { CATEGORY_VALIDATION } from '../constants/catalog-validation-messages.constants'
import { definedFields } from '../../../../shared/domain/patch'

export interface CategoryProps {
  name: string
  areaId?: string
}

export class Category extends Entity {
  readonly name: string
  readonly areaId: string | undefined

  private constructor(props: CategoryProps, id: string) {
    super(id)
    this.name = props.name
    this.areaId = props.areaId
  }

  static create(props: CategoryProps, id: string): Category {
    if (!props.name.trim()) throw new ValidationError('name', CATEGORY_VALIDATION.NAME_EMPTY)
    return new Category({ name: props.name.trim(), areaId: props.areaId }, id)
  }

  rename(name: string): Category {
    return Category.create({ ...this.toProps(), name }, this.id)
  }

  update(patch: { name?: string; areaId: string | undefined }): Category {
    return Category.create(
      { ...this.toProps(), ...definedFields({ name: patch.name }), areaId: patch.areaId },
      this.id,
    )
  }

  private toProps(): CategoryProps {
    return {
      name: this.name,
      areaId: this.areaId,
    }
  }
}
