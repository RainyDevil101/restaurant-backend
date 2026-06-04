import { OrderStatus } from '@src/modules/orders/domain/value-objects/order-status.vo'
import { ORDER_STATUS } from '@src/modules/orders/domain/constants/order-status.constants'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('OrderStatus', () => {
  describe('of', () => {
    it('creates a status from a valid value', () => {
      expect(OrderStatus.of(ORDER_STATUS.PENDING).value).toBe(ORDER_STATUS.PENDING)
    })

    it('throws ValidationError for an unknown value', () => {
      expect(() => OrderStatus.of('flying')).toThrow(ValidationError)
    })
  })

  describe('isTerminal', () => {
    it('is true for delivered and cancelled', () => {
      expect(OrderStatus.of(ORDER_STATUS.DELIVERED).isTerminal).toBe(true)
      expect(OrderStatus.of(ORDER_STATUS.CANCELLED).isTerminal).toBe(true)
    })

    it('is false for pending', () => {
      expect(OrderStatus.of(ORDER_STATUS.PENDING).isTerminal).toBe(false)
    })
  })

  describe('transitionTo', () => {
    it('allows a direct transition from pending to delivered', () => {
      const next = OrderStatus.of(ORDER_STATUS.DELIVERED)
      expect(OrderStatus.of(ORDER_STATUS.PENDING).transitionTo(next)).toBe(next)
    })

    it('allows cancelling a pending order', () => {
      const next = OrderStatus.of(ORDER_STATUS.CANCELLED)
      expect(OrderStatus.of(ORDER_STATUS.PENDING).transitionTo(next)).toBe(next)
    })

    it('rejects moving a pending order into the in-progress state', () => {
      const next = OrderStatus.of(ORDER_STATUS.IN_PROGRESS)
      expect(() => OrderStatus.of(ORDER_STATUS.PENDING).transitionTo(next)).toThrow(ValidationError)
    })

    it('rejects any transition out of a terminal state', () => {
      const next = OrderStatus.of(ORDER_STATUS.PENDING)
      expect(() => OrderStatus.of(ORDER_STATUS.DELIVERED).transitionTo(next)).toThrow(ValidationError)
    })
  })
})
