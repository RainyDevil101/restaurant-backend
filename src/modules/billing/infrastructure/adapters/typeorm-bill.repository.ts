import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bill } from '../../domain/entities/bill.entity'
import type { IBillRepository } from '../../domain/ports/bill.repository.port'
import { BillOrmEntity } from '../persistence/bill.orm-entity'

@Injectable()
export class TypeormBillRepository implements IBillRepository {
  constructor(
    @InjectRepository(BillOrmEntity)
    private readonly repo: Repository<BillOrmEntity>,
  ) {}

  private toDomain(row: BillOrmEntity): Bill {
    const bill = Bill.create(
      { tableId: row.tableId, items: row.items, total: row.total, createdAt: row.createdAt },
      row.id,
    )
    if (row.paid) bill.markPaid()
    return bill
  }

  private toOrm(bill: Bill): BillOrmEntity {
    const row = new BillOrmEntity()
    row.id = bill.id
    row.tableId = bill.tableId
    row.items = [...bill.items]
    row.total = bill.total
    row.createdAt = bill.createdAt
    row.paid = bill.paid
    return row
  }

  async findByTable(tableId: string): Promise<Bill | null> {
    const row = await this.repo.findOne({ where: { tableId }, order: { createdAt: 'DESC' } })
    return row ? this.toDomain(row) : null
  }

  async findById(id: string): Promise<Bill | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(bill: Bill): Promise<Bill> {
    await this.repo.save(this.toOrm(bill))
    return bill
  }

  async update(bill: Bill): Promise<Bill> {
    await this.repo.save(this.toOrm(bill))
    return bill
  }
}
