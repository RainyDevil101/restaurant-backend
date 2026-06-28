import { Injectable } from '@nestjs/common'
import type { Payment } from '../../domain/entities/payment.entity'
import type { IPaymentRepository } from '../../domain/ports/payment.repository.port'

@Injectable()
export class InMemoryPaymentRepository implements IPaymentRepository {
  private readonly store = new Map<string, Payment>()
  private readonly byBill = new Map<string, string>()

  async save(payment: Payment): Promise<Payment> {
    this.store.set(payment.id, payment)
    this.byBill.set(payment.billId, payment.id)
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    return this.store.get(id) ?? null
  }

  async findByBill(billId: string): Promise<Payment | null> {
    const paymentId = this.byBill.get(billId)
    return paymentId ? (this.store.get(paymentId) ?? null) : null
  }

  async findAll(): Promise<Payment[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => b.paidAt.getTime() - a.paidAt.getTime(),
    )
  }
}
