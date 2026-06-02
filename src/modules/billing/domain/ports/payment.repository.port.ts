import type { Payment } from '../entities/payment.entity'

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY')

export interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>
  findByBill(billId: string): Promise<Payment | null>
}
