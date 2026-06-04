import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CatalogModule } from '../catalog/catalog.module'
import { UsersModule } from '../users/users.module'
import { VenueModule } from '../venue/venue.module'
import { CancelOrderHandler } from './application/commands/cancel-order.handler'
import { CreateOrderHandler } from './application/commands/create-order.handler'
import { UpdateOrderStatusHandler } from './application/commands/update-order-status.handler'
import { GetOrdersByTableHandler } from './application/queries/get-orders-by-table.handler'
import { ORDER_NOTIFIER } from './domain/ports/order-notifier.port'
import { ORDER_REPOSITORY } from './domain/ports/order.repository.port'
import { OrdersController } from './http/orders.controller'
import { TypeormOrderRepository } from './infrastructure/adapters/typeorm-order.repository'
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity'
import { OrdersGateway } from './infrastructure/realtime/orders.gateway'

@Module({
  imports: [CqrsModule, AuthModule, CatalogModule, UsersModule, VenueModule, TypeOrmModule.forFeature([OrderOrmEntity])],
  controllers: [OrdersController],
  providers: [
    CancelOrderHandler,
    CreateOrderHandler,
    UpdateOrderStatusHandler,
    GetOrdersByTableHandler,
    OrdersGateway,
    { provide: ORDER_REPOSITORY, useClass: TypeormOrderRepository },
    { provide: ORDER_NOTIFIER, useExisting: OrdersGateway },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
