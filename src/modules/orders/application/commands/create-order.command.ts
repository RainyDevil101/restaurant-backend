import type { CreateOrderDto } from '../dtos/order.dto'

export class CreateOrderCommand {
  constructor(
    readonly dto: CreateOrderDto,
    readonly createdBy: string,
  ) {}
}
