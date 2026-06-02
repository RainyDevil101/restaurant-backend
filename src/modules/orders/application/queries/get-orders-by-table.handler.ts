import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { Order } from '../../domain/entities/order.entity'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { GetOrdersByTableQuery } from './get-orders-by-table.query'

@QueryHandler(GetOrdersByTableQuery)
@Injectable()
export class GetOrdersByTableHandler implements IQueryHandler<GetOrdersByTableQuery> {
  constructor(@Inject(ORDER_REPOSITORY) private readonly repo: IOrderRepository) {}

  execute({ tableId }: GetOrdersByTableQuery): Promise<Order[]> {
    return this.repo.findAll({ tableId })
  }
}
