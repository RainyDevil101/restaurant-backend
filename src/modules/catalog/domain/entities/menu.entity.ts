import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { MENU_VALIDATION } from '../constants/catalog-validation-messages.constants'
import { definedFields } from '../../../../shared/domain/patch'

export interface MenuProps {
  name: string
  productIds: string[]
  active: boolean
  price: number
}

export class Menu extends Entity {
  readonly name: string
  readonly productIds: readonly string[]
  readonly active: boolean
  readonly price: number

  private constructor(props: MenuProps, id: string) {
    super(id)
    this.name = props.name
    this.productIds = [...props.productIds]
    this.active = props.active
    this.price = props.price
  }

  static create(props: MenuProps, id: string): Menu {
    if (!props.name.trim()) throw new ValidationError('name', MENU_VALIDATION.NAME_EMPTY)
    if (props.price < 0) throw new ValidationError('price', MENU_VALIDATION.PRICE_NEGATIVE)
    return new Menu({ ...props, name: props.name.trim() }, id)
  }

  update(patch: Partial<Pick<MenuProps, 'name' | 'productIds' | 'price'>>): Menu {
    return Menu.create({ ...this.toProps(), ...definedFields(patch) }, this.id)
  }

  toggleActive(): Menu {
    return Menu.create({ ...this.toProps(), active: !this.active }, this.id)
  }

  private toProps(): MenuProps {
    return { name: this.name, productIds: [...this.productIds], active: this.active, price: this.price }
  }
}
