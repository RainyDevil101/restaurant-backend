import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { TABLE_STATUS } from '../../../venue/domain/constants/table-status.constants'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../../orders/domain/ports/order.repository.port'
import { ORDER_STATUS } from '../../../orders/domain/constants/order-status.constants'
import { BILL_ERROR } from '../constants/billing-error-messages.constants'
import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import { Payment } from '../../domain/entities/payment.entity'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '../../domain/ports/payment.repository.port'
import { ProcessPaymentCommand } from './process-payment.command'
import { type IOrderNotifier, ORDER_NOTIFIER } from '../../../orders/domain/ports/order-notifier.port'

@CommandHandler(ProcessPaymentCommand)
@Injectable()
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  constructor(
    @Inject(BILL_REPOSITORY)    private readonly billRepo: IBillRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
    @Inject(TABLE_REPOSITORY)   private readonly tableRepo: ITableRepository,
    @Inject(ORDER_REPOSITORY)   private readonly orderRepo: IOrderRepository,
    @Inject(ORDER_NOTIFIER)     private readonly notifier: IOrderNotifier,
  ) {}

  async execute({ tableId, dto }: ProcessPaymentCommand): Promise<Payment> {
    const bill = findOrThrow(await this.billRepo.findByTable(tableId), ENTITY_NAME.BILL, tableId)
    if (bill.paid) throw new ValidationError('bill', BILL_ERROR.ALREADY_PAID)
    if (dto.amount < bill.total) {
      throw new ValidationError('amount', BILL_ERROR.AMOUNT_TOO_LOW(dto.amount, bill.total))
    }

    const change = dto.method === PAYMENT_METHOD.CASH ? dto.amount - bill.total : 0
    const payment = Payment.create(
      { billId: bill.id, tableId, amount: dto.amount, method: dto.method, change, paidAt: new Date() },
      randomUUID(),
    )
    await this.paymentRepo.save(payment)

    bill.markPaid()
    await this.billRepo.update(bill)

    const table = await this.tableRepo.findById(tableId)
    if (table?.status.value === TABLE_STATUS.PENDING_PAYMENT) {
      await this.tableRepo.update(table.updateStatus(TABLE_STATUS.FREE))
      this.notifier.notifyTableStatusChanged(tableId, TABLE_STATUS.FREE)
    }

    const unpaidOrders = await this.orderRepo.findAll({ tableId, status: ORDER_STATUS.DELIVERED, paid: false })
    for (const order of unpaidOrders) {
      await this.orderRepo.update(order.markPaid())
    }

    return payment
  }
}
