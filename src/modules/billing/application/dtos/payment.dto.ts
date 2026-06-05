import { IsIn, IsNumber, Min } from 'class-validator'
import type { BillItemProps } from '../../domain/entities/bill.entity'
import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import type { PaymentMethodValue } from '../../domain/entities/payment.entity'

export interface PaymentWithItemsDto {
  id: string
  billId: string
  tableId: string
  amount: number
  method: PaymentMethodValue
  change: number
  paidAt: Date
  items: BillItemProps[]
  waiterIds: string[]
}

export class ProcessPaymentDto {
  @IsIn(Object.values(PAYMENT_METHOD))
  method!: PaymentMethodValue

  @IsNumber()
  @Min(0)
  amount!: number
}
