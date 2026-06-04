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
  const menuRepo = { findById: jest.fn().mockResolvedValue(null) }
  const notifier = { notifyNewOrder: jest.fn(), notifyStatusChanged: jest.fn() }
  const handler = new CreateOrderHandler(
    orderRepo as any,
    tableRepo as any,
    productRepo as any,
    menuRepo as any,
    notifier as any,
  )
  return { handler, orderRepo, tableRepo, productRepo, menuRepo, notifier }
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

  it('snapshots a combo line from the menu when menuId is provided', async () => {
    const { handler, menuRepo } = buildDeps()
    menuRepo.findById.mockResolvedValue({ id: 'menu-1', name: 'Menú principal', price: 199 })

    const result = await handler.execute(
      new CreateOrderCommand(
        { tableId: 'table-1', items: [{ menuId: 'menu-1', quantity: 2 }] },
        'user-1',
      ),
    )

    expect(menuRepo.findById).toHaveBeenCalledWith('menu-1')
    expect(result.items[0]?.kind).toBe('combo')
    expect(result.items[0]?.productId).toBe('menu-1')
    expect(result.items[0]?.productName).toBe('Menú principal')
    expect(result.items[0]?.unitPrice).toBe(199)
    expect(result.items[0]?.subtotal).toBe(398)
  })

  it('defaults kind to product for a product line', async () => {
    const { handler } = buildDeps()

    const result = await handler.execute(command())

    expect(result.items[0]?.kind).toBe('product')
  })

  it('throws NotFoundError when the combo menu is missing', async () => {
    const { handler, menuRepo } = buildDeps()
    menuRepo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(
        new CreateOrderCommand(
          { tableId: 'table-1', items: [{ menuId: 'missing', quantity: 1 }] },
          'user-1',
        ),
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('throws ValidationError when an item has neither productId nor menuId', async () => {
    const { handler } = buildDeps()

    await expect(
      handler.execute(
        new CreateOrderCommand(
          { tableId: 'table-1', items: [{ quantity: 1 } as any] },
          'user-1',
        ),
      ),
    ).rejects.toThrow(ValidationError)
  })

  it('throws ValidationError when an item has both productId and menuId', async () => {
    const { handler } = buildDeps()

    await expect(
      handler.execute(
        new CreateOrderCommand(
          { tableId: 'table-1', items: [{ productId: 'prod-1', menuId: 'menu-1', quantity: 1 }] },
          'user-1',
        ),
      ),
    ).rejects.toThrow(ValidationError)
  })
})
