import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthModule } from '../auth/auth.module'
import { CatalogModule } from '../catalog/catalog.module'
import { VenueModule } from '../venue/venue.module'
import { CreateOrderHandler } from './application/commands/create-order.handler'
import { UpdateOrderStatusHandler } from './application/commands/update-order-status.handler'
import { GetOrdersByTableHandler } from './application/queries/get-orders-by-table.handler'
import { ORDER_NOTIFIER } from './domain/ports/order-notifier.port'
import { ORDER_REPOSITORY } from './domain/ports/order.repository.port'
import { OrdersController } from './http/orders.controller'
import { InMemoryOrderRepository } from './infrastructure/adapters/in-memory-order.repository'
import { OrdersGateway } from './infrastructure/realtime/orders.gateway'

@Module({
  imports: [CqrsModule, AuthModule, CatalogModule, VenueModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderHandler,
    UpdateOrderStatusHandler,
    GetOrdersByTableHandler,
    OrdersGateway,
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
    { provide: ORDER_NOTIFIER, useExisting: OrdersGateway },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
