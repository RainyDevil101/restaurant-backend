import { Order, type OrderSeedProps } from '@src/modules/orders/domain/entities/order.entity'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const itemInput = {
  productId: 'prod-1',
  productName: 'Tacos',
  quantity: 2,
  unitPrice: 50,
}

describe('Order', () => {
  describe('create', () => {
    it('creates an order with generated item ids and computed subtotals', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(order.id).toBe('order-1')
      expect(order.tableId).toBe('table-1')
      expect(order.createdBy).toBe('user-1')
      expect(order.items).toHaveLength(1)
      expect(order.items[0]?.itemId).toEqual(expect.any(String))
      expect(order.items[0]?.subtotal).toBe(100)
    })

    it('defaults paid to false', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(order.paid).toBe(false)
    })

    it('defaults the status to pending', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(order.status.value).toBe(ORDER_STATUS.PENDING)
    })

    it('defaults createdAt to the current time when omitted', () => {
      const before = Date.now()
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(before)
    })

    it('honors an explicit status and createdAt', () => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z')
      const order = Order.create(
        {
          tableId: 'table-1',
          createdBy: 'user-1',
          createdAt,
          status: ORDER_STATUS.IN_PROGRESS,
          items: [itemInput],
        },
        'order-1',
      )

      expect(order.status.value).toBe(ORDER_STATUS.IN_PROGRESS)
      expect(order.createdAt).toBe(createdAt)
    })

    it('throws ValidationError when there are no items', () => {
      expect(() =>
        Order.create({ tableId: 'table-1', createdBy: 'user-1', items: [] }, 'order-1'),
      ).toThrow(ValidationError)
    })

    it('freezes the items collection', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(Object.isFrozen(order.items)).toBe(true)
    })
  })

  describe('rehydrate', () => {
    const seed: OrderSeedProps = {
      tableId: 'table-1',
      createdBy: 'user-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      status: ORDER_STATUS.READY,
      paid: true,
      items: [{ ...itemInput, itemId: 'item-1', subtotal: 100 }],
    }

    it('restores all persisted fields', () => {
      const order = Order.rehydrate(seed, 'order-1')

      expect(order.id).toBe('order-1')
      expect(order.status.value).toBe(ORDER_STATUS.READY)
      expect(order.paid).toBe(true)
      expect(order.items[0]?.itemId).toBe('item-1')
      expect(order.items[0]?.subtotal).toBe(100)
    })
  })

  describe('total', () => {
    it('sums every item subtotal', () => {
      const order = Order.create(
        {
          tableId: 'table-1',
          createdBy: 'user-1',
          items: [
            { ...itemInput, quantity: 2, unitPrice: 50 },
            { ...itemInput, productId: 'prod-2', quantity: 3, unitPrice: 10 },
          ],
        },
        'order-1',
      )

      expect(order.total).toBe(130)
    })
  })

  describe('toJSON', () => {
    it('exposes the status as its primitive value and includes the total', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(order.toJSON()).toMatchObject({
        id: 'order-1',
        tableId: 'table-1',
        createdBy: 'user-1',
        status: ORDER_STATUS.PENDING,
        total: 100,
      })
    })
  })

  describe('updateStatus', () => {
    it('returns a new order with the next status on a valid transition', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      const updated = order.updateStatus(ORDER_STATUS.DELIVERED)

      expect(updated.status.value).toBe(ORDER_STATUS.DELIVERED)
      expect(updated.id).toBe('order-1')
      expect(order.status.value).toBe(ORDER_STATUS.PENDING)
    })

    it('throws ValidationError on an invalid transition', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', items: [itemInput] },
        'order-1',
      )

      expect(() => order.updateStatus(ORDER_STATUS.IN_PROGRESS)).toThrow(ValidationError)
    })

    it('preserves the paid flag across a status change', () => {
      const order = Order.rehydrate(
        {
          tableId: 'table-1',
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          status: ORDER_STATUS.READY,
          paid: true,
          items: [{ ...itemInput, itemId: 'item-1', subtotal: 100 }],
        },
        'order-1',
      )

      const updated = order.updateStatus(ORDER_STATUS.DELIVERED)

      expect(updated.paid).toBe(true)
    })
  })

  describe('markPaid', () => {
    it('returns a paid copy preserving every other field', () => {
      const order = Order.create(
        { tableId: 'table-1', createdBy: 'user-1', status: ORDER_STATUS.DELIVERED, items: [itemInput] },
        'order-1',
      )

      const paid = order.markPaid()

      expect(paid.paid).toBe(true)
      expect(order.paid).toBe(false)
      expect(paid.id).toBe('order-1')
      expect(paid.status.value).toBe(ORDER_STATUS.DELIVERED)
      expect(paid.items).toHaveLength(1)
    })
  })
})
