import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { TABLE_STATUS } from '../../../venue/domain/constants/table-status.constants'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { BILL_ENTITY_NAME, BILL_ERROR } from '../constants/billing-error-messages.constants'
import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import { Payment } from '../../domain/entities/payment.entity'
import { BILL_REPOSITORY, type IBillRepository } from '../../domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '../../domain/ports/payment.repository.port'
import { ProcessPaymentCommand } from './process-payment.command'

@CommandHandler(ProcessPaymentCommand)
@Injectable()
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  constructor(
    @Inject(BILL_REPOSITORY)    private readonly billRepo: IBillRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
    @Inject(TABLE_REPOSITORY)   private readonly tableRepo: ITableRepository,
  ) {}

  async execute({ tableId, dto }: ProcessPaymentCommand): Promise<Payment> {
    const bill = await this.billRepo.findByTable(tableId)
    if (!bill) throw new NotFoundError(BILL_ENTITY_NAME, tableId)
    if (bill.paid) throw new ValidationError('bill', BILL_ERROR.ALREADY_PAID)
    if (dto.amount < bill.total) {
      throw new ValidationError('amount', `Amount ${dto.amount} is less than total ${bill.total}`)
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
    }

    return payment
  }
}
