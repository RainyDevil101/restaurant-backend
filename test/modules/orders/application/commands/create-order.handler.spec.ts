import { CreateOrderHandler } from '@src/modules/orders/application/commands/create-order.handler'
import { CreateOrderCommand } from '@src/modules/orders/application/commands/create-order.command'
import { Order } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const buildProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  name: 'Tacos',
  price: 50,
  available: true,
  ...overrides,
})

const buildDeps = () => {
  const orderRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn((order: Order) => Promise.resolve(order)),
    update: jest.fn(),
  }
  const tableRepo = { findById: jest.fn().mockResolvedValue({ id: 'table-1' }) }
  const productRepo = { findByIds: jest.fn().mockResolvedValue([buildProduct()]) }
  const notifier = { notifyNewOrder: jest.fn(), notifyStatusChanged: jest.fn() }
  const handler = new CreateOrderHandler(
    orderRepo as any,
    tableRepo as any,
    productRepo as any,
    notifier as any,
  )
  return { handler, orderRepo, tableRepo, productRepo, notifier }
}

const command = () =>
  new CreateOrderCommand(
    { tableId: 'table-1', items: [{ productId: 'prod-1', quantity: 2 }] },
    'user-1',
  )

describe('CreateOrderHandler', () => {
  it('saves a pending order built from the catalog snapshot', async () => {
    const { handler, orderRepo } = buildDeps()

    const result = await handler.execute(command())

    expect(orderRepo.save).toHaveBeenCalledTimes(1)
    expect(result.tableId).toBe('table-1')
    expect(result.createdBy).toBe('user-1')
    expect(result.status.value).toBe(ORDER_STATUS.PENDING)
    expect(result.items[0]?.productName).toBe('Tacos')
    expect(result.items[0]?.unitPrice).toBe(50)
    expect(result.items[0]?.subtotal).toBe(100)
  })

  it('notifies of the new order with the saved entity', async () => {
    const { handler, notifier } = buildDeps()

    const result = await handler.execute(command())

    expect(notifier.notifyNewOrder).toHaveBeenCalledWith(result)
  })

  it('throws NotFoundError when the table does not exist', async () => {
    const { handler, tableRepo, orderRepo } = buildDeps()
    tableRepo.findById.mockResolvedValue(null)

    await expect(handler.execute(command())).rejects.toThrow(NotFoundError)
    expect(orderRepo.save).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when a product is missing', async () => {
    const { handler, productRepo } = buildDeps()
    productRepo.findByIds.mockResolvedValue([])

    await expect(handler.execute(command())).rejects.toThrow(NotFoundError)
  })

  it('throws ValidationError when a product is unavailable', async () => {
    const { handler, productRepo } = buildDeps()
    productRepo.findByIds.mockResolvedValue([buildProduct({ available: false })])

    await expect(handler.execute(command())).rejects.toThrow(ValidationError)
  })
})
