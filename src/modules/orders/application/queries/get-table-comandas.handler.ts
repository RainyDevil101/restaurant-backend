import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../../catalog/domain/ports/category.repository.port'
import { AREA_REPOSITORY, type IAreaRepository } from '../../../venue/domain/ports/area.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { COMANDA_RENDERER, type IComandaRenderer } from '../../domain/ports/comanda-renderer.port'
import { ORDER_STATUS } from '../../domain/constants/order-status.constants'
import { COMANDA_VALIDATION } from '../constants/order-validation-messages.constants'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import { type ComandaDto, assembleComandas } from '../services/comanda-assembler'
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
      throw new ValidationError('orders', COMANDA_VALIDATION.NO_ACTIVE_ORDERS)
    }

    const items = orders.flatMap((order) => order.items)
    const table = await this.tableRepo.findById(tableId)
    return assembleComandas(
      items,
      {
        products: this.productRepo,
        categories: this.categoryRepo,
        areas: this.areaRepo,
        renderer: this.renderer,
      },
      {
        tableName: table?.name ?? tableId,
        dateTime: new Date(),
        columns: PAPER_COLUMNS[paperWidth],
        mergeLines: true,
      },
    )
  }
}
