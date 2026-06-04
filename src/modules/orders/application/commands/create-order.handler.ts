import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { Order, type OrderCreateProps } from '../../domain/entities/order.entity'
import { ORDER_NOTIFIER, type IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { CreateOrderCommand } from './create-order.command'

@CommandHandler(CreateOrderCommand)
@Injectable()
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)   private readonly orderRepo: IOrderRepository,
    @Inject(TABLE_REPOSITORY)   private readonly tableRepo: ITableRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(ORDER_NOTIFIER)     private readonly notifier: IOrderNotifier,
  ) {}

  async execute({ dto, createdBy }: CreateOrderCommand): Promise<Order> {
    const table = await this.tableRepo.findById(dto.tableId)
    if (!table) throw new NotFoundError(ENTITY_NAME.TABLE, dto.tableId)

    const products = await this.productRepo.findByIds(dto.items.map((i) => i.productId))
    const productMap = new Map(products.map((p) => [p.id, p]))

    const itemProps: OrderCreateProps['items'] = []
    for (const input of dto.items) {
      const product = productMap.get(input.productId)
      if (!product) throw new NotFoundError(ENTITY_NAME.PRODUCT, input.productId)
      if (!product.available) throw new ValidationError('product', `"${product.name}" is not available`)
      itemProps.push({
        productId: product.id,
        productName: product.name,
        quantity: input.quantity,
        unitPrice: product.price,
        notes: input.notes,
      })
    }

    const saved = await this.orderRepo.save(
      Order.create({ tableId: dto.tableId, createdBy, items: itemProps }, randomUUID()),
    )
    this.notifier.notifyNewOrder(saved)
    return saved
  }
}
