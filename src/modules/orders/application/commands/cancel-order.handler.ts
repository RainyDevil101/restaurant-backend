import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { ROLE } from '../../../../shared/constants/roles.constants'
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error'
import { ValidationError } from '../../../../shared/domain/errors/validation.error'
import { InvalidCredentialsError } from '../../../auth/domain/errors/invalid-credentials.error'
import { PASSWORD_SERVICE, type IPasswordService } from '../../../auth/domain/ports/password.service.port'
import { USER_REPOSITORY, type IUserRepository } from '../../../users/domain/ports/user.repository.port'
import { TABLE_REPOSITORY, type ITableRepository } from '../../../venue/domain/ports/table.repository.port'
import { TABLE_STATUS } from '../../../venue/domain/constants/table-status.constants'
import type { Order } from '../../domain/entities/order.entity'
import { ORDER_STATUS } from '../../domain/constants/order-status.constants'
import { ORDER_VALIDATION } from '../../domain/constants/order-validation-messages.constants'
import { ORDER_NOTIFIER, type IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { ORDER_REPOSITORY, type IOrderRepository } from '../../domain/ports/order.repository.port'
import { ORDER_ENTITY_NAME } from '../constants/order-error-messages.constants'
import { CancelOrderCommand } from './cancel-order.command'

@CommandHandler(CancelOrderCommand)
@Injectable()
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    @Inject(ORDER_NOTIFIER) private readonly notifier: IOrderNotifier,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
  ) {}

  async execute({ orderId, reason, adminEmail, adminCredential }: CancelOrderCommand): Promise<Order> {
    const admin = await this.userRepo.findByEmail(adminEmail.toLowerCase())
    if (!admin || !admin.active) throw new InvalidCredentialsError()

    const validCredential = await this.passwordService.compare(adminCredential, admin.hashedCredential)
    if (!validCredential) throw new InvalidCredentialsError()
    if (admin.role !== ROLE.ADMIN) throw new InvalidCredentialsError()

    const order = await this.orderRepo.findById(orderId)
    if (!order) throw new NotFoundError(ORDER_ENTITY_NAME, orderId)
    if (order.paid) throw new ValidationError('order', ORDER_VALIDATION.CANCEL_ALREADY_PAID)
    if (order.status.value === ORDER_STATUS.CANCELLED) {
      throw new ValidationError('order', ORDER_VALIDATION.CANCEL_ALREADY_CANCELLED)
    }

    const trimmedReason = reason.trim()
    if (trimmedReason.length === 0) {
      throw new ValidationError('reason', ORDER_VALIDATION.CANCEL_REASON_EMPTY)
    }

    const cancelled = await this.orderRepo.update(
      order.cancel({ reason: trimmedReason, cancelledBy: admin.id }),
    )
    this.notifier.notifyStatusChanged(cancelled)

    const tableOrders = await this.orderRepo.findAll({ tableId: cancelled.tableId })
    const stillActive = tableOrders.some(
      (o) => o.status.value !== ORDER_STATUS.CANCELLED && !o.paid,
    )
    if (!stillActive) {
      const table = await this.tableRepo.findById(cancelled.tableId)
      if (table && table.status.value !== TABLE_STATUS.FREE) {
        await this.tableRepo.update(table.updateStatus(TABLE_STATUS.FREE))
      }
    }

    return cancelled
  }
}
