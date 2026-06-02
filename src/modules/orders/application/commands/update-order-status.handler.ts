import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import type { Order } from '../../domain/entities/order.entity'
import { ORDER_NOTIFIER, type IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { UpdateOrderStatusCommand } from './update-order-status.command'

@CommandHandler(UpdateOrderStatusCommand)
@Injectable()
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(ORDER_NOTIFIER)   private readonly notifier: IOrderNotifier,
  ) {}

  async execute({ id, status }: UpdateOrderStatusCommand): Promise<Order> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('Order', id)
    const saved = await this.orderRepo.update(order.updateStatus(status))
    this.notifier.notifyStatusChanged(saved)
    return saved
  }
}
