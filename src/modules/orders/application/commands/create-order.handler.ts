import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'crypto'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { PRODUCT_REPOSITORY, type IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import { MENU_REPOSITORY, type IMenuRepository } from '../../../catalog/domain/ports/menu.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { Order, type OrderCreateProps } from '../../domain/entities/order.entity'
import { ORDER_NOTIFIER, type IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { ITEM_KIND } from '../../../../shared/constants/item-kind.constants'
import { ITEM_VALIDATION, PRODUCT_VALIDATION } from '../constants/order-validation-messages.constants'
import { CreateOrderCommand } from './create-order.command'

@CommandHandler(CreateOrderCommand)
@Injectable()
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)   private readonly orderRepo: IOrderRepository,
    @Inject(TABLE_REPOSITORY)   private readonly tableRepo: ITableRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(MENU_REPOSITORY)    private readonly menuRepo: IMenuRepository,
    @Inject(ORDER_NOTIFIER)     private readonly notifier: IOrderNotifier,
  ) {}

  async execute({ dto, createdBy }: CreateOrderCommand): Promise<Order> {
    findOrThrow(await this.tableRepo.findById(dto.tableId), ENTITY_NAME.TABLE, dto.tableId)

    const productIds = dto.items.flatMap((i) => (i.productId ? [i.productId] : []))
    const products = await this.productRepo.findByIds(productIds)
    const productMap = new Map(products.map((p) => [p.id, p]))

    const itemProps: OrderCreateProps['items'] = []
    for (const input of dto.items) {
      const hasProduct = Boolean(input.productId)
      const hasMenu = Boolean(input.menuId)
      if (hasProduct === hasMenu) {
        throw new ValidationError('item', ITEM_VALIDATION.EXACTLY_ONE_REFERENCE)
      }

      if (input.productId) {
        const product = findOrThrow(productMap.get(input.productId), ENTITY_NAME.PRODUCT, input.productId)
        if (!product.available) throw new ValidationError('product', PRODUCT_VALIDATION.notAvailable(product.name))
        itemProps.push({
          kind: ITEM_KIND.PRODUCT,
          productId: product.id,
          productName: product.name,
          quantity: input.quantity,
          unitPrice: product.price,
          notes: input.notes,
        })
        continue
      }

      const menu = findOrThrow(await this.menuRepo.findById(input.menuId!), ENTITY_NAME.MENU, input.menuId!)
      itemProps.push({
        kind: ITEM_KIND.COMBO,
        productId: menu.id,
        productName: menu.name,
        quantity: input.quantity,
        unitPrice: menu.price,
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
