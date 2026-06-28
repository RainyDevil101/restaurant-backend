import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { findOrThrow } from '../../../../shared/application/find-or-throw'
import type { Order } from '../../domain/entities/order.entity'
import { ORDER_NOTIFIER, type IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { ENTITY_NAME } from '../../../../shared/constants/entity-names.constants'
import { UpdateOrderStatusCommand } from './update-order-status.command'

@CommandHandler(UpdateOrderStatusCommand)
@Injectable()
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(ORDER_NOTIFIER)   private readonly notifier: IOrderNotifier,
  ) {}

  async execute({ id, status }: UpdateOrderStatusCommand): Promise<Order> {
    const order = findOrThrow(await this.orderRepo.findById(id), ENTITY_NAME.ORDER, id)
    const saved = await this.orderRepo.update(order.updateStatus(status))
    this.notifier.notifyStatusChanged(saved)
    return saved
  }
}
