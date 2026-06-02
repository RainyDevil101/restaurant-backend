import { IsIn, IsNumber, Min } from 'class-validator'
import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import type { PaymentMethodValue } from '../../domain/entities/payment.entity'

export class ProcessPaymentDto {
  @IsIn(Object.values(PAYMENT_METHOD))
  method!: PaymentMethodValue

  @IsNumber()
  @Min(0)
  amount!: number
}
