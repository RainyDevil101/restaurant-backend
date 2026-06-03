import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { definedFields } from '../../../../shared/domain/patch'

export interface MenuProps {
  name: string
  productIds: string[]
  active: boolean
}

export class Menu extends Entity {
  readonly name: string
  readonly productIds: readonly string[]
  readonly active: boolean

  private constructor(props: MenuProps, id: string) {
    super(id)
    this.name = props.name
    this.productIds = [...props.productIds]
    this.active = props.active
  }

  static create(props: MenuProps, id: string): Menu {
    if (!props.name.trim()) throw new ValidationError('name', 'Menu name cannot be empty')
    return new Menu({ ...props, name: props.name.trim() }, id)
  }

  update(patch: Partial<Pick<MenuProps, 'name' | 'productIds'>>): Menu {
    return Menu.create({ ...this.toProps(), ...definedFields(patch) }, this.id)
  }

  toggleActive(): Menu {
    return Menu.create({ ...this.toProps(), active: !this.active }, this.id)
  }

  private toProps(): MenuProps {
    return { name: this.name, productIds: [...this.productIds], active: this.active }
  }
}
