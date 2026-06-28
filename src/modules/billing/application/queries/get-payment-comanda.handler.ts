import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '../../../catalog/domain/ports/product.repository.port'
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '../../../catalog/domain/ports/category.repository.port'
import {
  AREA_REPOSITORY,
  type IAreaRepository,
} from '../../../venue/domain/ports/area.repository.port'
import {
  TABLE_REPOSITORY,
  type ITableRepository,
} from '../../../venue/domain/ports/table.repository.port'
import {
  COMANDA_RENDERER,
  type IComandaRenderer,
} from '../../../orders/domain/ports/comanda-renderer.port'
import {
  type ComandaDto,
  assembleComandas,
} from '../../../orders/application/services/comanda-assembler'
import { PAPER_COLUMNS } from '../../../settings/domain/constants/paper-width.constants'
import {
  BILL_REPOSITORY,
  type IBillRepository,
} from '../../domain/ports/bill.repository.port'
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/ports/payment.repository.port'
import { BILL_ERROR } from '../constants/billing-error-messages.constants'
import { GetPaymentComandaQuery } from './get-payment-comanda.query'

@QueryHandler(GetPaymentComandaQuery)
@Injectable()
export class GetPaymentComandaHandler implements IQueryHandler<GetPaymentComandaQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    @Inject(BILL_REPOSITORY) private readonly billRepo: IBillRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(AREA_REPOSITORY) private readonly areaRepo: IAreaRepository,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
    @Inject(COMANDA_RENDERER) private readonly renderer: IComandaRenderer,
  ) {}

  async execute({
    paymentId,
    paperWidth,
  }: GetPaymentComandaQuery): Promise<ComandaDto[]> {
    const payment = findOrThrow(await this.paymentRepo.findById(paymentId), ENTITY_NAME.PAYMENT, paymentId)

    const bill = findOrThrow(await this.billRepo.findById(payment.billId), ENTITY_NAME.BILL, payment.billId)
    if (bill.items.length === 0) {
      throw new ValidationError('items', BILL_ERROR.NO_DELIVERED_ORDERS)
    }

    const table = await this.tableRepo.findById(payment.tableId)
    return assembleComandas(
      bill.items,
      {
        products: this.productRepo,
        categories: this.categoryRepo,
        areas: this.areaRepo,
        renderer: this.renderer,
      },
      {
        tableName: table?.name ?? payment.tableId,
        dateTime: payment.paidAt,
        columns: PAPER_COLUMNS[paperWidth],
        mergeLines: true,
      },
    )
  }
}
