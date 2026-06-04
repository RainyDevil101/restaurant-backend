import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../../orders/domain/ports/order.repository.port'
import { ORDER_STATUS } from '../../../orders/domain/constants/order-status.constants'
import { Bill, type BillItemProps } from '../../domain/entities/bill.entity'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { BILL_ERROR } from '../constants/billing-error-messages.constants'
import { ConsolidateBillCommand } from './consolidate-bill.command'

@CommandHandler(ConsolidateBillCommand)
@Injectable()
export class ConsolidateBillHandler implements ICommandHandler<ConsolidateBillCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(BILL_REPOSITORY)  private readonly billRepo: IBillRepository,
  ) {}

  async execute({ tableId }: ConsolidateBillCommand): Promise<Bill> {
    const existing = await this.billRepo.findByTable(tableId)
    if (existing && !existing.paid) return existing

    const deliveredOrders = await this.orderRepo.findAll({ tableId, status: ORDER_STATUS.DELIVERED })
    if (deliveredOrders.length === 0) {
      throw new ValidationError('orders', BILL_ERROR.NO_DELIVERED_ORDERS)
    }

    const itemMap = new Map<string, BillItemProps>()
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const key = `${item.productId}:${item.unitPrice}`
        const entry = itemMap.get(key)
        if (entry) {
          entry.quantity += item.quantity
          entry.subtotal += item.subtotal
        } else {
          itemMap.set(key, { ...item })
        }
      }
    }

    const items = [...itemMap.values()]
    const total = items.reduce((sum, i) => sum + i.subtotal, 0)
    return this.billRepo.save(Bill.create({ tableId, items, total, createdAt: new Date() }, randomUUID()))
  }
}
