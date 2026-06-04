import { ProcessPaymentHandler } from '@src/modules/billing/application/commands/process-payment.handler'
import { ProcessPaymentCommand } from '@src/modules/billing/application/commands/process-payment.command'
import { Bill } from '@src/modules/billing/domain/entities/bill.entity'
import { PAYMENT_METHOD } from '@src/modules/billing/domain/constants/payment-method.constants'
import type { IBillRepository } from '@src/modules/billing/domain/ports/bill.repository.port'
import type { IPaymentRepository } from '@src/modules/billing/domain/ports/payment.repository.port'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import type { ITableRepository } from '@src/modules/venue/domain/ports/table.repository.port'
import { Order } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import type { IOrderRepository } from '@src/modules/orders/domain/ports/order.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const buildBill = (total: number): Bill =>
  Bill.create({ tableId: 'table-1', items: [], total, createdAt: new Date() }, 'bill-1')

const buildDeliveredOrder = (id: string): Order =>
  Order.create(
    {
      tableId: 'table-1',
      createdBy: 'user-1',
      status: ORDER_STATUS.DELIVERED,
      items: [{ productId: 'p1', productName: 'Tacos', quantity: 1, unitPrice: 50 }],
    },
    id,
  )

const buildTable = (status: string): Table =>
  Table.create({ name: 'Mesa 1', capacity: 4, status: status as never, areaId: 'area-1' }, 'table-1')

describe('ProcessPaymentHandler', () => {
  let billRepo: jest.Mocked<IBillRepository>
  let paymentRepo: jest.Mocked<IPaymentRepository>
  let tableRepo: jest.Mocked<ITableRepository>
  let orderRepo: jest.Mocked<IOrderRepository>
  let handler: ProcessPaymentHandler

  beforeEach(() => {
    billRepo = {
      findByTable: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    paymentRepo = {
      save: jest.fn(),
      findByBill: jest.fn(),
    }
    tableRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    orderRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    handler = new ProcessPaymentHandler(billRepo, paymentRepo, tableRepo, orderRepo)
  })

  it('persists a cash payment with the correct change', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.PENDING_PAYMENT))

    const result = await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 120 }),
    )

    expect(result.change).toBe(20)
    expect(result.amount).toBe(120)
    expect(result.method).toBe(PAYMENT_METHOD.CASH)
    expect(result.billId).toBe('bill-1')
    expect(paymentRepo.save).toHaveBeenCalledWith(result)
  })

  it('reports no change for card payments even when the amount exceeds the total', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.PENDING_PAYMENT))

    const result = await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CARD, amount: 150 }),
    )

    expect(result.change).toBe(0)
  })

  it('marks the bill paid and persists the change', async () => {
    const bill = buildBill(100)
    billRepo.findByTable.mockResolvedValue(bill)
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.PENDING_PAYMENT))

    await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
    )

    expect(bill.paid).toBe(true)
    expect(billRepo.update).toHaveBeenCalledWith(bill)
  })

  it('marks the table delivered-unpaid orders as paid', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.PENDING_PAYMENT))
    orderRepo.findAll.mockResolvedValue([buildDeliveredOrder('order-1'), buildDeliveredOrder('order-2')])

    await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
    )

    expect(orderRepo.findAll).toHaveBeenCalledWith({
      tableId: 'table-1',
      status: ORDER_STATUS.DELIVERED,
      paid: false,
    })
    expect(orderRepo.update).toHaveBeenCalledTimes(2)
    for (const call of orderRepo.update.mock.calls) {
      expect(call[0]?.paid).toBe(true)
    }
  })

  it('frees a table that was pending payment', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.PENDING_PAYMENT))

    await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
    )

    expect(tableRepo.update).toHaveBeenCalledTimes(1)
    const freed = tableRepo.update.mock.calls[0]?.[0]
    expect(freed?.status.value).toBe(TABLE_STATUS.FREE)
  })

  it('does not transition a table that is not pending payment', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(buildTable(TABLE_STATUS.OCCUPIED))

    await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
    )

    expect(tableRepo.update).not.toHaveBeenCalled()
  })

  it('does not fail when the table no longer exists', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))
    tableRepo.findById.mockResolvedValue(null)

    const result = await handler.execute(
      new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
    )

    expect(result.amount).toBe(100)
    expect(tableRepo.update).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when no bill exists for the table', async () => {
    billRepo.findByTable.mockResolvedValue(null)

    await expect(
      handler.execute(
        new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
      ),
    ).rejects.toThrow(NotFoundError)
    expect(paymentRepo.save).not.toHaveBeenCalled()
  })

  it('throws ValidationError when the bill is already paid', async () => {
    const bill = buildBill(100)
    bill.markPaid()
    billRepo.findByTable.mockResolvedValue(bill)

    await expect(
      handler.execute(
        new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 100 }),
      ),
    ).rejects.toThrow(ValidationError)
    expect(paymentRepo.save).not.toHaveBeenCalled()
  })

  it('throws ValidationError when the amount is below the total', async () => {
    billRepo.findByTable.mockResolvedValue(buildBill(100))

    await expect(
      handler.execute(
        new ProcessPaymentCommand('table-1', { method: PAYMENT_METHOD.CASH, amount: 80 }),
      ),
    ).rejects.toThrow(ValidationError)
    expect(paymentRepo.save).not.toHaveBeenCalled()
  })
})
