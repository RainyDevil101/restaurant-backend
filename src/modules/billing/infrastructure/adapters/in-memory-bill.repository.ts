import { Injectable } from '@nestjs/common'
import type { Bill } from '../../domain/entities/bill.entity'
import type { IBillRepository } from '../../domain/ports/bill.repository.port'

@Injectable()
export class InMemoryBillRepository implements IBillRepository {
  private readonly store = new Map<string, Bill>()
  private readonly byTable = new Map<string, string>() // tableId → billId

  async findByTable(tableId: string): Promise<Bill | null> {
    const billId = this.byTable.get(tableId)
    return billId ? (this.store.get(billId) ?? null) : null
  }

  async findById(id: string): Promise<Bill | null> {
    return this.store.get(id) ?? null
  }

  async save(bill: Bill): Promise<Bill> {
    this.store.set(bill.id, bill)
    this.byTable.set(bill.tableId, bill.id)
    return bill
  }

  async update(bill: Bill): Promise<Bill> {
    this.store.set(bill.id, bill)
    return bill
  }
}
