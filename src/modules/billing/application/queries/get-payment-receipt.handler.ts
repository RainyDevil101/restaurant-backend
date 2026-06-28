import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import {
  TABLE_REPOSITORY,
  type ITableRepository,
} from '../../../venue/domain/ports/table.repository.port'
import {
  RECEIPT_SETTINGS_REPOSITORY,
  type IReceiptSettingsRepository,
} from '../../../settings/domain/ports/receipt-settings.repository.port'
import {
  RECEIPT_RENDERER,
  type IReceiptRenderer,
} from '../../domain/ports/receipt-renderer.port'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import { PAYMENT_METHOD } from '../../domain/constants/payment-method.constants'
import {
  BILL_REPOSITORY,
  type IBillRepository,
} from '../../domain/ports/bill.repository.port'
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/ports/payment.repository.port'
import {
  RECEIPT_LABELS,
  paymentMethodLabel,
} from '../constants/billing-labels.constants'
import { type ReceiptDto, receiptHeader, toReceiptLine } from '../services/receipt-builder'
import { GetPaymentReceiptQuery } from './get-payment-receipt.query'

@QueryHandler(GetPaymentReceiptQuery)
@Injectable()
export class GetPaymentReceiptHandler implements IQueryHandler<GetPaymentReceiptQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
    @Inject(BILL_REPOSITORY) private readonly billRepo: IBillRepository,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(RECEIPT_SETTINGS_REPOSITORY) private readonly receiptRepo: IReceiptSettingsRepository,
    @Inject(RECEIPT_RENDERER) private readonly renderer: IReceiptRenderer,
  ) {}

  async execute({ paymentId, paperWidth }: GetPaymentReceiptQuery): Promise<ReceiptDto> {
    const payment = findOrThrow(await this.paymentRepo.findById(paymentId), ENTITY_NAME.PAYMENT, paymentId)

    const bill = findOrThrow(await this.billRepo.findById(payment.billId), ENTITY_NAME.BILL, payment.billId)

    const lines = bill.items.map(toReceiptLine)
    const table = await this.tableRepo.findById(payment.tableId)
    const columns = PAPER_COLUMNS[paperWidth]
    const isCash = payment.method === PAYMENT_METHOD.CASH

    const rendered = this.renderer.render({
      ...receiptHeader(await this.receiptRepo.get()),
      title: RECEIPT_LABELS.RECEIPT_TITLE,
      tableName: table?.name ?? payment.tableId,
      dateTime: payment.paidAt,
      lines,
      total: bill.total,
      payment: {
        methodLabel: paymentMethodLabel(payment.method),
        amountPaid: payment.amount,
        change: isCash ? payment.change : undefined,
      },
      columns,
    })

    return { ...rendered, paperWidth }
  }
}
