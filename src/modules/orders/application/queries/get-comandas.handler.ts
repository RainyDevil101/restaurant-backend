import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
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
import { ORDER_ENTITY_NAME } from '../constants/order-error-messages.constants'
import { ORDER_LABELS } from '../constants/order-labels.constants'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import { GetComandasQuery } from './get-comandas.query'

export interface ComandaDto {
  areaId: string | null
  areaName: string
  preview: string
  escposBase64: string
}

@QueryHandler(GetComandasQuery)
@Injectable()
export class GetComandasHandler implements IQueryHandler<GetComandasQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
    @Inject(AREA_REPOSITORY) private readonly areaRepo: IAreaRepository,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(COMANDA_RENDERER) private readonly renderer: IComandaRenderer,
  ) {}

  async execute({ orderId, paperWidth }: GetComandasQuery): Promise<ComandaDto[]> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) throw new NotFoundError(ORDER_ENTITY_NAME, orderId)

    const products = await this.productRepo.findByIds(order.items.map((item) => item.productId))
    const productById = new Map(products.map((product) => [product.id, product]))
    const categoryById = new Map((await this.categoryRepo.findAll()).map((c) => [c.id, c]))
    const areaById = new Map((await this.areaRepo.findAll()).map((a) => [a.id, a]))
    const table = await this.tableRepo.findById(order.tableId)

    const groups = new Map<
      string,
      { areaId: string | null; areaName: string; lines: ComandaLine[] }
    >()
    for (const item of order.items) {
      const product = productById.get(item.productId)
      const category = product ? categoryById.get(product.categoryId) : undefined
      const areaId = category?.areaId ?? null
      const key = areaId ?? '__general__'
      const areaName = areaId ? (areaById.get(areaId)?.name ?? ORDER_LABELS.GENERAL_AREA) : ORDER_LABELS.GENERAL_AREA
      const group = groups.get(key) ?? { areaId, areaName, lines: [] }
      group.lines.push({ quantity: item.quantity, name: item.productName, notes: item.notes })
      groups.set(key, group)
    }

    const columns = PAPER_COLUMNS[paperWidth]
    const tableName = table?.name ?? order.tableId
    const dateTime = new Date()

    return [...groups.values()].map((group) => {
      const rendered = this.renderer.render({
        areaName: group.areaName,
        tableName,
        dateTime,
        lines: group.lines,
        columns,
      })
      return { areaId: group.areaId, areaName: group.areaName, ...rendered }
    })
  }
}
