import type { Order } from '../entities/order.entity'

export const ORDER_NOTIFIER = Symbol('ORDER_NOTIFIER')

export interface IOrderNotifier {
  notifyNewOrder(order: Order): void
  notifyStatusChanged(order: Order): void
  notifyTableStatusChanged(tableId: string, status: string): void
}
