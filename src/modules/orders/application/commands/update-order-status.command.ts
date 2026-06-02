import type { OrderStatusValue } from '../../domain/value-objects/order-status.vo'

export class UpdateOrderStatusCommand {
  constructor(
    readonly id: string,
    readonly status: OrderStatusValue,
  ) {}
}
