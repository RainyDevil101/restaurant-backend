import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRODUCT_VALIDATION } from '../constants/catalog-validation-messages.constants'
import { definedFields } from '../../../../shared/domain/patch'

export interface ProductProps {
  name: string
  description?: string
  price: number
  categoryId: string
  available: boolean
}

export class Product extends Entity {
  readonly name: string
  readonly description: string | undefined
  readonly price: number
  readonly categoryId: string
  readonly available: boolean

  private constructor(props: ProductProps, id: string) {
    super(id)
    this.name = props.name
    this.description = props.description
    this.price = props.price
    this.categoryId = props.categoryId
    this.available = props.available
  }

  static create(props: ProductProps, id: string): Product {
    if (!props.name.trim()) throw new ValidationError('name', PRODUCT_VALIDATION.NAME_EMPTY)
    if (props.price < 0) throw new ValidationError('price', PRODUCT_VALIDATION.PRICE_NEGATIVE)
    return new Product({ ...props, name: props.name.trim() }, id)
  }

  update(patch: Partial<ProductProps>): Product {
    return Product.create({ ...this.toProps(), ...definedFields(patch) }, this.id)
  }

  toggleAvailability(): Product {
    return Product.create({ ...this.toProps(), available: !this.available }, this.id)
  }

  private toProps(): ProductProps {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      categoryId: this.categoryId,
      available: this.available,
    }
  }
}
