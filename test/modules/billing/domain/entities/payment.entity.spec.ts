import { Payment } from '@src/modules/billing/domain/entities/payment.entity'
import { PAYMENT_METHOD } from '@src/modules/billing/domain/constants/payment-method.constants'

describe('Payment', () => {
  describe('create', () => {
    it('exposes every provided field', () => {
      const paidAt = new Date('2026-06-03T12:00:00Z')
      const payment = Payment.create(
        {
          billId: 'bill-1',
          tableId: 'table-1',
          amount: 120,
          method: PAYMENT_METHOD.CASH,
          change: 20,
          paidAt,
        },
        'payment-1',
      )

      expect(payment.id).toBe('payment-1')
      expect(payment.billId).toBe('bill-1')
      expect(payment.tableId).toBe('table-1')
      expect(payment.amount).toBe(120)
      expect(payment.method).toBe(PAYMENT_METHOD.CASH)
      expect(payment.change).toBe(20)
      expect(payment.paidAt).toBe(paidAt)
    })

    it('supports card payments with no change', () => {
      const payment = Payment.create(
        {
          billId: 'bill-1',
          tableId: 'table-1',
          amount: 100,
          method: PAYMENT_METHOD.CARD,
          change: 0,
          paidAt: new Date(),
        },
        'payment-1',
      )

      expect(payment.method).toBe(PAYMENT_METHOD.CARD)
      expect(payment.change).toBe(0)
    })
  })

  describe('equals', () => {
    it('is true for payments sharing the same id', () => {
      const props = {
        billId: 'bill-1',
        tableId: 'table-1',
        amount: 100,
        method: PAYMENT_METHOD.CARD,
        change: 0,
        paidAt: new Date(),
      }
      const a = Payment.create(props, 'payment-1')
      const b = Payment.create(props, 'payment-1')

      expect(a.equals(b)).toBe(true)
    })

    it('is false for payments with different ids', () => {
      const props = {
        billId: 'bill-1',
        tableId: 'table-1',
        amount: 100,
        method: PAYMENT_METHOD.CARD,
        change: 0,
        paidAt: new Date(),
      }
      const a = Payment.create(props, 'payment-1')
      const b = Payment.create(props, 'payment-2')

      expect(a.equals(b)).toBe(false)
    })
  })
})
