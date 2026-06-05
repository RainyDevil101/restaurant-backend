import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Payment } from '../../domain/entities/payment.entity'
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '../../domain/ports/payment.repository.port'
import { GetAllPaymentsQuery } from './get-all-payments.query'

@QueryHandler(GetAllPaymentsQuery)
@Injectable()
export class GetAllPaymentsHandler implements IQueryHandler<GetAllPaymentsQuery> {
  constructor(@Inject(PAYMENT_REPOSITORY) private readonly repo: IPaymentRepository) {}

  execute(_query: GetAllPaymentsQuery): Promise<Payment[]> {
    return this.repo.findAll()
  }
}
