import { randomUUID } from 'crypto'
import { Entity } from '../../../../shared/domain/entity.base'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { OrderStatus, type OrderStatusValue } from '../value-objects/order-status.vo'
import { ORDER_STATUS } from '../constants/order-status.constants'
import { ORDER_VALIDATION } from '../constants/order-validation-messages.constants'

export interface OrderItemProps {
  itemId: string
  kind?: 'product' | 'combo'
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
}

export interface OrderCreateProps {
  tableId: string
  createdBy: string
  createdAt?: Date
  status?: OrderStatusValue
  items: Omit<OrderItemProps, 'itemId' | 'subtotal'>[]
}

export interface OrderSeedProps {
  tableId: string
  createdBy: string
  createdAt: Date
  status: OrderStatusValue
  paid: boolean
  items: OrderItemProps[]
  cancelledBy?: string
  cancellationReason?: string
  cancelledAt?: Date
}

export class Order extends Entity {
  readonly tableId: string
  readonly createdBy: string
  readonly createdAt: Date
  readonly status: OrderStatus
  readonly paid: boolean
  readonly items: readonly OrderItemProps[]
  readonly cancelledBy?: string
  readonly cancellationReason?: string
  readonly cancelledAt?: Date

  private constructor(props: OrderSeedProps, id: string) {
    super(id)
    this.tableId = props.tableId
    this.createdBy = props.createdBy
    this.createdAt = props.createdAt
    this.status = OrderStatus.of(props.status)
    this.paid = props.paid
    this.items = Object.freeze(props.items.map((item) => ({ ...item, kind: item.kind ?? 'product' })))
    this.cancelledBy = props.cancelledBy
    this.cancellationReason = props.cancellationReason
    this.cancelledAt = props.cancelledAt
  }

  /** Creates a new order, generating item IDs and computing subtotals. */
  static create(props: OrderCreateProps, id: string): Order {
    if (props.items.length === 0) {
      throw new ValidationError('items', ORDER_VALIDATION.ITEMS_EMPTY)
    }
    const items: OrderItemProps[] = props.items.map((item) => ({
      ...item,
      kind: item.kind ?? 'product',
      itemId: randomUUID(),
      subtotal: item.quantity * item.unitPrice,
    }))
    return new Order(
      {
        tableId: props.tableId,
        createdBy: props.createdBy,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? ORDER_STATUS.PENDING,
        paid: false,
        items,
      },
      id,
    )
  }

  /** Re-hydrates a persisted order (e.g. from in-memory seed). */
  static rehydrate(props: OrderSeedProps, id: string): Order {
    return new Order(props, id)
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  toJSON() {
    return {
      id: this.id,
      tableId: this.tableId,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      status: this.status.value,
      paid: this.paid,
      items: [...this.items],
      total: this.total,
      cancelledBy: this.cancelledBy,
      cancellationReason: this.cancellationReason,
      cancelledAt: this.cancelledAt,
    }
  }

  updateStatus(next: OrderStatusValue): Order {
    this.status.transitionTo(OrderStatus.of(next)) // throws if invalid
    return Order.rehydrate(
      { ...this.toSeedProps(), status: next },
      this.id,
    )
  }

  markPaid(): Order {
    return Order.rehydrate({ ...this.toSeedProps(), paid: true }, this.id)
  }

  cancel(params: { reason: string; cancelledBy: string }): Order {
    const next = this.status.transitionTo(OrderStatus.CANCELLED)
    return Order.rehydrate(
      {
        ...this.toSeedProps(),
        status: next.value,
        cancelledBy: params.cancelledBy,
        cancellationReason: params.reason,
        cancelledAt: new Date(),
      },
      this.id,
    )
  }

  private toSeedProps(): OrderSeedProps {
    return {
      tableId: this.tableId,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      status: this.status.value,
      paid: this.paid,
      items: [...this.items],
      cancelledBy: this.cancelledBy,
      cancellationReason: this.cancellationReason,
      cancelledAt: this.cancelledAt,
    }
  }
}
