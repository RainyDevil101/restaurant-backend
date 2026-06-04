import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ValueObject } from '../../../../shared/domain/value-object.base'
import { ORDER_STATUS, ORDER_STATUS_VALIDATION } from '../constants/order-status.constants'

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

const VALID: OrderStatusValue[] = Object.values(ORDER_STATUS)

const TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  [ORDER_STATUS.PENDING]:     [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.READY,       ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]:       [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]:   [],
  [ORDER_STATUS.CANCELLED]:   [],
}

export class OrderStatus extends ValueObject<{ value: OrderStatusValue }> {
  static readonly PENDING     = new OrderStatus(ORDER_STATUS.PENDING)
  static readonly IN_PROGRESS = new OrderStatus(ORDER_STATUS.IN_PROGRESS)
  static readonly READY       = new OrderStatus(ORDER_STATUS.READY)
  static readonly DELIVERED   = new OrderStatus(ORDER_STATUS.DELIVERED)
  static readonly CANCELLED   = new OrderStatus(ORDER_STATUS.CANCELLED)

  private constructor(value: OrderStatusValue) {
    super({ value })
  }

  static of(value: string): OrderStatus {
    if (!VALID.includes(value as OrderStatusValue)) {
      throw new ValidationError('orderStatus', ORDER_STATUS_VALIDATION.INVALID_VALUE(value))
    }
    return new OrderStatus(value as OrderStatusValue)
  }

  get value(): OrderStatusValue {
    return this.props.value
  }

  get isTerminal(): boolean {
    return this.value === ORDER_STATUS.DELIVERED || this.value === ORDER_STATUS.CANCELLED
  }

  toJSON(): OrderStatusValue {
    return this.props.value
  }

  transitionTo(next: OrderStatus): OrderStatus {
    if (!TRANSITIONS[this.value].includes(next.value)) {
      throw new ValidationError(
        'orderStatus',
        ORDER_STATUS_VALIDATION.INVALID_TRANSITION(this.value, next.value),
      )
    }
    return next
  }
}
