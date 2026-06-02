import type { Bill } from '../entities/bill.entity'

export const BILL_REPOSITORY = Symbol('BILL_REPOSITORY')

export interface IBillRepository {
  findByTable(tableId: string): Promise<Bill | null>
  findById(id: string): Promise<Bill | null>
  save(bill: Bill): Promise<Bill>
  update(bill: Bill): Promise<Bill>
}
