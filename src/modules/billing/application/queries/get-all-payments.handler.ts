import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '../../domain/ports/payment.repository.port'
import type { PaymentWithItemsDto } from '../dtos/payment.dto'
import { GetAllPaymentsQuery } from './get-all-payments.query'

@QueryHandler(GetAllPaymentsQuery)
@Injectable()
export class GetAllPaymentsHandler implements IQueryHandler<GetAllPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
    @Inject(BILL_REPOSITORY) private readonly billRepo: IBillRepository,
  ) {}

  async execute(_query: GetAllPaymentsQuery): Promise<PaymentWithItemsDto[]> {
    const payments = await this.paymentRepo.findAll()
    return Promise.all(
      payments.map(async (p) => {
        const bill = await this.billRepo.findById(p.billId)
        return {
          id: p.id,
          billId: p.billId,
          tableId: p.tableId,
          amount: p.amount,
          method: p.method,
          change: p.change,
          paidAt: p.paidAt,
          items: bill ? [...bill.items] : [],
          waiterIds: bill ? [...bill.waiterIds] : [],
        }
      }),
    )
  }
}
