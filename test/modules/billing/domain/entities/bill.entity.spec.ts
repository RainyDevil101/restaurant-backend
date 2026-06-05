import { Bill, type BillItemProps } from '@src/modules/billing/domain/entities/bill.entity'

const buildItem = (overrides: Partial<BillItemProps> = {}): BillItemProps => ({
  productId: 'prod-1',
  productName: 'Tacos',
  quantity: 2,
  unitPrice: 50,
  subtotal: 100,
  ...overrides,
})

describe('Bill', () => {
  describe('create', () => {
    it('exposes the provided table, total and timestamp', () => {
      const createdAt = new Date('2026-06-03T12:00:00Z')
      const bill = Bill.create(
        { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt },
        'bill-1',
      )

      expect(bill.id).toBe('bill-1')
      expect(bill.tableId).toBe('table-1')
      expect(bill.total).toBe(100)
      expect(bill.createdAt).toBe(createdAt)
    })

    it('starts unpaid regardless of the input', () => {
      const bill = Bill.create(
        { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      expect(bill.paid).toBe(false)
    })

    it('copies the items so the original array cannot mutate the bill', () => {
      const items = [buildItem()]
      const bill = Bill.create(
        { tableId: 'table-1', items, total: 100, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      items.push(buildItem({ productId: 'prod-2' }))

      expect(bill.items).toHaveLength(1)
    })

    it('freezes the items collection against mutation', () => {
      const bill = Bill.create(
        { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      expect(() => (bill.items as BillItemProps[]).push(buildItem())).toThrow()
    })

    it('preserves every item and its fields', () => {
      const items = [buildItem(), buildItem({ productId: 'prod-2', subtotal: 200 })]
      const bill = Bill.create(
        { tableId: 'table-1', items, total: 300, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      expect(bill.items).toHaveLength(2)
      expect(bill.items[1]?.productId).toBe('prod-2')
      expect(bill.items[1]?.subtotal).toBe(200)
    })
  })

  describe('markPaid', () => {
    it('flips the paid flag to true', () => {
      const bill = Bill.create(
        { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      bill.markPaid()

      expect(bill.paid).toBe(true)
    })

    it('is idempotent when called repeatedly', () => {
      const bill = Bill.create(
        { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() },
        'bill-1',
      )

      bill.markPaid()
      bill.markPaid()

      expect(bill.paid).toBe(true)
    })
  })

  describe('equals', () => {
    it('is true for bills sharing the same id', () => {
      const props = { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() }
      const a = Bill.create(props, 'bill-1')
      const b = Bill.create(props, 'bill-1')

      expect(a.equals(b)).toBe(true)
    })

    it('is false for bills with different ids', () => {
      const props = { tableId: 'table-1', items: [buildItem()], total: 100, waiterIds: [], createdAt: new Date() }
      const a = Bill.create(props, 'bill-1')
      const b = Bill.create(props, 'bill-2')

      expect(a.equals(b)).toBe(false)
    })
  })
})
