import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../../../catalog/domain/ports/category.repository.port'
import { AREA_REPOSITORY, type IAreaRepository } from '../../../venue/domain/ports/area.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { COMANDA_RENDERER, type IComandaRenderer } from '../../domain/ports/comanda-renderer.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import { type ComandaDto, assembleComandas } from '../services/comanda-assembler'
import { GetComandasQuery } from './get-comandas.query'

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
    const order = findOrThrow(await this.orderRepo.findById(orderId), ENTITY_NAME.ORDER, orderId)

    const table = await this.tableRepo.findById(order.tableId)
    return assembleComandas(
      order.items,
      {
        products: this.productRepo,
        categories: this.categoryRepo,
        areas: this.areaRepo,
        renderer: this.renderer,
      },
      {
        tableName: table?.name ?? order.tableId,
        dateTime: new Date(),
        columns: PAPER_COLUMNS[paperWidth],
        mergeLines: false,
      },
    )
  }
}
