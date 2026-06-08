import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../../catalog/domain/ports/category.repository.port'
import { AREA_REPOSITORY, type IAreaRepository } from '../../../venue/domain/ports/area.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import {
  COMANDA_RENDERER,
  type IComandaRenderer,
  type ComandaLine,
} from '../../domain/ports/comanda-renderer.port'
import { ORDER_LABELS } from '../constants/order-labels.constants'
import { ORDER_STATUS } from '../../domain/constants/order-status.constants'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import type { ComandaDto } from './get-comandas.handler'
import { GetTableComandasQuery } from './get-table-comandas.query'

@QueryHandler(GetTableComandasQuery)
@Injectable()
export class GetTableComandasHandler implements IQueryHandler<GetTableComandasQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
    @Inject(AREA_REPOSITORY) private readonly areaRepo: IAreaRepository,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(COMANDA_RENDERER) private readonly renderer: IComandaRenderer,
  ) {}

  async execute({ tableId, paperWidth }: GetTableComandasQuery): Promise<ComandaDto[]> {
    const orders = (await this.orderRepo.findAll({ tableId })).filter(
      (order) => order.status.value !== ORDER_STATUS.CANCELLED && !order.paid,
    )
    if (orders.length === 0) {
      throw new ValidationError('orders', 'No hay pedidos activos en la mesa para imprimir la comanda')
    }

    const allProductIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))]
    const products = await this.productRepo.findByIds(allProductIds)
    const productById = new Map(products.map((p) => [p.id, p]))
    const categoryById = new Map((await this.categoryRepo.findAll()).map((c) => [c.id, c]))
    const areaById = new Map((await this.areaRepo.findAll()).map((a) => [a.id, a]))
    const table = await this.tableRepo.findById(tableId)

    const groups = new Map<
      string,
      { areaId: string | null; areaName: string; lines: Map<string, ComandaLine> }
    >()

    for (const order of orders) {
      for (const item of order.items) {
        const product = productById.get(item.productId)
        const category = product ? categoryById.get(product.categoryId) : undefined
        const areaId = category?.areaId ?? null
        const key = areaId ?? '__general__'
        const areaName = areaId
          ? (areaById.get(areaId)?.name ?? ORDER_LABELS.GENERAL_AREA)
          : ORDER_LABELS.GENERAL_AREA

        if (!groups.has(key)) {
          groups.set(key, { areaId, areaName, lines: new Map() })
        }
        const group = groups.get(key)!
        const existing = group.lines.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          group.lines.set(item.productId, {
            quantity: item.quantity,
            name: item.productName,
            notes: item.notes,
          })
        }
      }
    }

    const columns = PAPER_COLUMNS[paperWidth]
    const tableName = table?.name ?? tableId
    const dateTime = new Date()

    return [...groups.values()].map((group) => {
      const rendered = this.renderer.render({
        areaName: group.areaName,
        tableName,
        dateTime,
        lines: [...group.lines.values()],
        columns,
      })
      return { areaId: group.areaId, areaName: group.areaName, ...rendered }
    })
  }
}
