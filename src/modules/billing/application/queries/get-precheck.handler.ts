import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../../orders/domain/ports/order.repository.port'
import { ORDER_STATUS } from '../../../orders/domain/constants/order-status.constants'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import {
  RECEIPT_SETTINGS_REPOSITORY,
  type IReceiptSettingsRepository,
} from '../../../settings/domain/ports/receipt-settings.repository.port'
import {
  RECEIPT_RENDERER,
  type IReceiptRenderer,
  type ReceiptLine,
  type RenderedReceipt,
} from '../../domain/ports/receipt-renderer.port'
import { GetPrecheckQuery } from './get-precheck.query'

export interface PrecheckDto extends RenderedReceipt {
  paperWidth: number
}

const RECEIPT_DEFAULTS = {
  businessName: 'La Fragua del Diablo',
  address: '',
  footer: 'PRECUENTA · No válido como boleta',
}

@QueryHandler(GetPrecheckQuery)
@Injectable()
export class GetPrecheckHandler implements IQueryHandler<GetPrecheckQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(RECEIPT_SETTINGS_REPOSITORY) private readonly receiptRepo: IReceiptSettingsRepository,
    @Inject(RECEIPT_RENDERER) private readonly renderer: IReceiptRenderer,
  ) {}

  async execute({ tableId, paperWidth }: GetPrecheckQuery): Promise<PrecheckDto> {
    const orders = (await this.orderRepo.findAll({ tableId })).filter(
      (order) => order.status.value !== ORDER_STATUS.CANCELLED && !order.paid,
    )
    if (orders.length === 0) {
      throw new ValidationError('orders', 'No hay pedidos activos en la mesa para la precuenta')
    }

    const itemMap = new Map<string, ReceiptLine>()
    for (const order of orders) {
      for (const item of order.items) {
        const entry = itemMap.get(item.productId)
        if (entry) {
          entry.quantity += item.quantity
          entry.subtotal += item.subtotal
        } else {
          itemMap.set(item.productId, {
            quantity: item.quantity,
            name: item.productName,
            subtotal: item.subtotal,
            isCombo: item.kind === 'combo',
          })
        }
      }
    }
    const lines = [...itemMap.values()]
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0)

    const table = await this.tableRepo.findById(tableId)
    const settings = await this.receiptRepo.get()
    const columns = paperWidth === 58 ? 32 : 48

    const rendered = this.renderer.render({
      businessName: settings?.businessName ?? RECEIPT_DEFAULTS.businessName,
      address: settings?.address ?? RECEIPT_DEFAULTS.address,
      footer: settings?.footer ?? RECEIPT_DEFAULTS.footer,
      tableName: table?.name ?? tableId,
      dateTime: new Date(),
      lines,
      total,
      columns,
    })

    return { ...rendered, paperWidth }
  }
}
