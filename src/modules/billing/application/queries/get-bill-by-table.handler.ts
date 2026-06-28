import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import type { Bill } from '../../domain/entities/bill.entity'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { GetBillByTableQuery } from './get-bill-by-table.query'

@QueryHandler(GetBillByTableQuery)
@Injectable()
export class GetBillByTableHandler implements IQueryHandler<GetBillByTableQuery> {
  constructor(@Inject(BILL_REPOSITORY) private readonly repo: IBillRepository) {}

  async execute({ tableId }: GetBillByTableQuery): Promise<Bill> {
    const bill = findOrThrow(await this.repo.findByTable(tableId), ENTITY_NAME.BILL, tableId)
    return bill
  }
}
