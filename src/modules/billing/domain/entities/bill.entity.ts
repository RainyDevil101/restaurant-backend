import { Entity } from '../../../../shared/domain/entity.base'
import type { ItemKind } from '../../../../shared/constants/item-kind.constants'

export interface BillItemProps {
  kind?: ItemKind
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface BillProps {
  tableId: string
  items: BillItemProps[]
  total: number
  waiterIds: string[]
  createdAt: Date
}

export class Bill extends Entity {
  readonly tableId: string
  readonly items: readonly BillItemProps[]
  readonly total: number
  readonly waiterIds: readonly string[]
  readonly createdAt: Date
  paid: boolean

  private constructor(props: BillProps, id: string) {
    super(id)
    this.tableId = props.tableId
    this.items = Object.freeze([...props.items])
    this.total = props.total
    this.waiterIds = Object.freeze([...props.waiterIds])
    this.createdAt = props.createdAt
    this.paid = false
  }

  static create(props: BillProps, id: string): Bill {
    return new Bill(props, id)
  }

  markPaid(): void {
    this.paid = true
  }
}
