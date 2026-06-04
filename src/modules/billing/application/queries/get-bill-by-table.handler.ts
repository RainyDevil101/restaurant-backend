import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Bill } from '../../domain/entities/bill.entity'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { BILL_ENTITY_NAME } from '../constants/billing-error-messages.constants'
import { GetBillByTableQuery } from './get-bill-by-table.query'

@QueryHandler(GetBillByTableQuery)
@Injectable()
export class GetBillByTableHandler implements IQueryHandler<GetBillByTableQuery> {
  constructor(@Inject(BILL_REPOSITORY) private readonly repo: IBillRepository) {}

  async execute({ tableId }: GetBillByTableQuery): Promise<Bill> {
    const bill = await this.repo.findByTable(tableId)
    if (!bill) throw new NotFoundError(BILL_ENTITY_NAME, tableId)
    return bill
  }
}
