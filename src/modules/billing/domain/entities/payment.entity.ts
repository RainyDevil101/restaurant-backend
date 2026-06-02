import { Entity } from '../../../../shared/domain/entity.base'
import { PAYMENT_METHOD } from '../constants/payment-method.constants'

export type PaymentMethodValue = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export interface PaymentProps {
  billId: string
  tableId: string
  amount: number
  method: PaymentMethodValue
  change: number
  paidAt: Date
}

export class Payment extends Entity {
  readonly billId: string
  readonly tableId: string
  readonly amount: number
  readonly method: PaymentMethodValue
  readonly change: number
  readonly paidAt: Date

  private constructor(props: PaymentProps, id: string) {
    super(id)
    this.billId = props.billId
    this.tableId = props.tableId
    this.amount = props.amount
    this.method = props.method
    this.change = props.change
    this.paidAt = props.paidAt
  }

  static create(props: PaymentProps, id: string): Payment {
    return new Payment(props, id)
  }
}
