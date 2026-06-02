import type { Order } from '../entities/order.entity'
import type { OrderStatusValue } from '../value-objects/order-status.vo'

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY')

export interface OrderFilters {
  tableId?: string
  status?: OrderStatusValue
}

export interface IOrderRepository {
  findAll(filters?: OrderFilters): Promise<Order[]>
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<Order>
  update(order: Order): Promise<Order>
}
