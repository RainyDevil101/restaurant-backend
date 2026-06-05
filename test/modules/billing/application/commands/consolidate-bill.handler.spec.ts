import { ConsolidateBillHandler } from '@src/modules/billing/application/commands/consolidate-bill.handler'
import { ConsolidateBillCommand } from '@src/modules/billing/application/commands/consolidate-bill.command'
import { Bill } from '@src/modules/billing/domain/entities/bill.entity'
import { Order } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import type { IBillRepository } from '@src/modules/billing/domain/ports/bill.repository.port'
import type { IOrderRepository } from '@src/modules/orders/domain/ports/order.repository.port'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const buildOrder = (
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[],
  id: string,
): Order =>
  Order.create(
    { tableId: 'table-1', createdBy: 'user-1', status: ORDER_STATUS.DELIVERED, items },
    id,
  )

describe('ConsolidateBillHandler', () => {
  let orderRepo: jest.Mocked<IOrderRepository>
  let billRepo: jest.Mocked<IBillRepository>
  let handler: ConsolidateBillHandler

  beforeEach(() => {
    orderRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    billRepo = {
      findByTable: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    handler = new ConsolidateBillHandler(orderRepo, billRepo)
  })

  it('returns the existing unpaid bill without rebuilding it', async () => {
    const existing = Bill.create(
      { tableId: 'table-1', items: [], total: 0, waiterIds: [], createdAt: new Date() },
      'bill-1',
    )
    billRepo.findByTable.mockResolvedValue(existing)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(result).toBe(existing)
    expect(orderRepo.findAll).not.toHaveBeenCalled()
    expect(billRepo.save).not.toHaveBeenCalled()
  })

  it('builds a new bill from the delivered orders when the existing bill is already paid', async () => {
    const paid = Bill.create(
      { tableId: 'table-1', items: [], total: 0, waiterIds: [], createdAt: new Date() },
      'bill-old',
    )
    paid.markPaid()
    billRepo.findByTable.mockResolvedValue(paid)
    orderRepo.findAll.mockResolvedValue([
      buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 50 }], 'order-1'),
    ])
    billRepo.save.mockImplementation(async (bill) => bill)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(orderRepo.findAll).toHaveBeenCalledWith({
      tableId: 'table-1',
      status: ORDER_STATUS.DELIVERED,
      paid: false,
    })
    expect(result.total).toBe(100)
  })

  it('consolidates only unpaid delivered orders, excluding already-paid ones', async () => {
    billRepo.findByTable.mockResolvedValue(null)
    const unpaid = buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 50 }], 'order-1')
    const paidOrder = buildOrder([{ productId: 'p2', productName: 'Agua', quantity: 1, unitPrice: 20 }], 'order-2').markPaid()
    orderRepo.findAll.mockImplementation(async (filters) =>
      [unpaid, paidOrder].filter(
        (o) =>
          (filters?.status === undefined || o.status.value === filters.status) &&
          (filters?.paid === undefined || o.paid === filters.paid),
      ),
    )
    billRepo.save.mockImplementation(async (bill) => bill)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(orderRepo.findAll).toHaveBeenCalledWith({
      tableId: 'table-1',
      status: ORDER_STATUS.DELIVERED,
      paid: false,
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.productId).toBe('p1')
    expect(result.total).toBe(100)
  })

  it('sums subtotals across orders and merges equal product lines', async () => {
    billRepo.findByTable.mockResolvedValue(null)
    orderRepo.findAll.mockResolvedValue([
      buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 50 }], 'order-1'),
      buildOrder(
        [
          { productId: 'p1', productName: 'Tacos', quantity: 1, unitPrice: 50 },
          { productId: 'p2', productName: 'Agua', quantity: 3, unitPrice: 20 },
        ],
        'order-2',
      ),
    ])
    billRepo.save.mockImplementation(async (bill) => bill)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(result.total).toBe(210)
    expect(result.items).toHaveLength(2)
    const tacos = result.items.find((i) => i.productId === 'p1')
    expect(tacos?.quantity).toBe(3)
    expect(tacos?.subtotal).toBe(150)
  })

  it('keeps the same product as separate lines when unit prices differ', async () => {
    billRepo.findByTable.mockResolvedValue(null)
    orderRepo.findAll.mockResolvedValue([
      buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 1, unitPrice: 50 }], 'order-1'),
      buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 1, unitPrice: 60 }], 'order-2'),
    ])
    billRepo.save.mockImplementation(async (bill) => bill)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(110)
  })

  it('persists the consolidated bill through the repository', async () => {
    billRepo.findByTable.mockResolvedValue(null)
    orderRepo.findAll.mockResolvedValue([
      buildOrder([{ productId: 'p1', productName: 'Tacos', quantity: 1, unitPrice: 50 }], 'order-1'),
    ])
    billRepo.save.mockImplementation(async (bill) => bill)

    const result = await handler.execute(new ConsolidateBillCommand('table-1'))

    expect(billRepo.save).toHaveBeenCalledTimes(1)
    expect(billRepo.save).toHaveBeenCalledWith(result)
    expect(result.tableId).toBe('table-1')
    expect(result.waiterIds).toEqual(['user-1'])
  })

  it('throws ValidationError when the table has no delivered orders', async () => {
    billRepo.findByTable.mockResolvedValue(null)
    orderRepo.findAll.mockResolvedValue([])

    await expect(handler.execute(new ConsolidateBillCommand('table-1'))).rejects.toThrow(
      ValidationError,
    )
    expect(billRepo.save).not.toHaveBeenCalled()
  })
})
