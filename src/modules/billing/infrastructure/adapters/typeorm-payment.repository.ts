import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Payment } from '../../domain/entities/payment.entity'
import type { IPaymentRepository } from '../../domain/ports/payment.repository.port'
import { PaymentOrmEntity } from '../persistence/payment.orm-entity'

@Injectable()
export class TypeormPaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repo: Repository<PaymentOrmEntity>,
  ) {}

  private toDomain(row: PaymentOrmEntity): Payment {
    return Payment.create(
      {
        billId: row.billId,
        tableId: row.tableId,
        amount: row.amount,
        method: row.method,
        change: row.change,
        paidAt: row.paidAt,
      },
      row.id,
    )
  }

  private toOrm(payment: Payment): PaymentOrmEntity {
    const row = new PaymentOrmEntity()
    row.id = payment.id
    row.billId = payment.billId
    row.tableId = payment.tableId
    row.amount = payment.amount
    row.method = payment.method
    row.change = payment.change
    row.paidAt = payment.paidAt
    return row
  }

  async save(payment: Payment): Promise<Payment> {
    await this.repo.save(this.toOrm(payment))
    return payment
  }

  async findByBill(billId: string): Promise<Payment | null> {
    const row = await this.repo.findOneBy({ billId })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<Payment[]> {
    const rows = await this.repo.find({ order: { paidAt: 'DESC' } })
    return rows.map((row) => this.toDomain(row))
  }
}
