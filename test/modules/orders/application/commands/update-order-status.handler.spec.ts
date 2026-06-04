import { UpdateOrderStatusHandler } from '@src/modules/orders/application/commands/update-order-status.handler'
import { UpdateOrderStatusCommand } from '@src/modules/orders/application/commands/update-order-status.command'
import { Order } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const buildOrder = () =>
  Order.create(
    {
      tableId: 'table-1',
      createdBy: 'user-1',
      items: [{ productId: 'prod-1', productName: 'Tacos', quantity: 1, unitPrice: 50 }],
    },
    'order-1',
  )

const buildDeps = () => {
  const orderRepo = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(buildOrder()),
    save: jest.fn(),
    update: jest.fn((order: Order) => Promise.resolve(order)),
  }
  const notifier = { notifyNewOrder: jest.fn(), notifyStatusChanged: jest.fn() }
  const handler = new UpdateOrderStatusHandler(orderRepo as any, notifier as any)
  return { handler, orderRepo, notifier }
}

describe('UpdateOrderStatusHandler', () => {
  it('updates the order to the next status and persists it', async () => {
    const { handler, orderRepo } = buildDeps()

    const result = await handler.execute(
      new UpdateOrderStatusCommand('order-1', ORDER_STATUS.DELIVERED),
    )

    expect(orderRepo.findById).toHaveBeenCalledWith('order-1')
    expect(orderRepo.update).toHaveBeenCalledTimes(1)
    expect(result.status.value).toBe(ORDER_STATUS.DELIVERED)
  })

  it('notifies of the status change with the saved order', async () => {
    const { handler, notifier } = buildDeps()

    const result = await handler.execute(
      new UpdateOrderStatusCommand('order-1', ORDER_STATUS.DELIVERED),
    )

    expect(notifier.notifyStatusChanged).toHaveBeenCalledWith(result)
  })

  it('throws NotFoundError when the order does not exist', async () => {
    const { handler, orderRepo } = buildDeps()
    orderRepo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new UpdateOrderStatusCommand('missing', ORDER_STATUS.IN_PROGRESS)),
    ).rejects.toThrow(NotFoundError)
    expect(orderRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError on an invalid status transition', async () => {
    const { handler, orderRepo, notifier } = buildDeps()

    await expect(
      handler.execute(new UpdateOrderStatusCommand('order-1', ORDER_STATUS.IN_PROGRESS)),
    ).rejects.toThrow(ValidationError)
    expect(orderRepo.update).not.toHaveBeenCalled()
    expect(notifier.notifyStatusChanged).not.toHaveBeenCalled()
  })
})
