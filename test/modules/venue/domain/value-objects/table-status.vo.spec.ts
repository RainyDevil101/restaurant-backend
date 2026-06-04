import { TableStatus } from '@src/modules/venue/domain/value-objects/table-status.vo'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('TableStatus', () => {
  describe('of', () => {
    it('creates a status from a valid value', () => {
      expect(TableStatus.of(TABLE_STATUS.FREE).value).toBe(TABLE_STATUS.FREE)
      expect(TableStatus.of(TABLE_STATUS.OCCUPIED).value).toBe(TABLE_STATUS.OCCUPIED)
      expect(TableStatus.of(TABLE_STATUS.PENDING_PAYMENT).value).toBe(TABLE_STATUS.PENDING_PAYMENT)
    })

    it('throws ValidationError for an unknown value', () => {
      expect(() => TableStatus.of('reservada')).toThrow(ValidationError)
    })
  })

  describe('toJSON', () => {
    it('serializes to its raw value', () => {
      expect(TableStatus.of(TABLE_STATUS.OCCUPIED).toJSON()).toBe(TABLE_STATUS.OCCUPIED)
    })
  })

  describe('transitionTo', () => {
    it('allows free to occupied', () => {
      const next = TableStatus.of(TABLE_STATUS.OCCUPIED)
      expect(TableStatus.of(TABLE_STATUS.FREE).transitionTo(next)).toBe(next)
    })

    it('allows occupied to pending payment', () => {
      const next = TableStatus.of(TABLE_STATUS.PENDING_PAYMENT)
      expect(TableStatus.of(TABLE_STATUS.OCCUPIED).transitionTo(next)).toBe(next)
    })

    it('allows pending payment back to free', () => {
      const next = TableStatus.of(TABLE_STATUS.FREE)
      expect(TableStatus.of(TABLE_STATUS.PENDING_PAYMENT).transitionTo(next)).toBe(next)
    })

    it('rejects free to pending payment', () => {
      const next = TableStatus.of(TABLE_STATUS.PENDING_PAYMENT)
      expect(() => TableStatus.of(TABLE_STATUS.FREE).transitionTo(next)).toThrow(ValidationError)
    })

    it('allows occupied to free', () => {
      const next = TableStatus.of(TABLE_STATUS.FREE)
      expect(TableStatus.of(TABLE_STATUS.OCCUPIED).transitionTo(next)).toBe(next)
    })

    it('rejects pending payment to occupied', () => {
      const next = TableStatus.of(TABLE_STATUS.OCCUPIED)
      expect(() =>
        TableStatus.of(TABLE_STATUS.PENDING_PAYMENT).transitionTo(next),
      ).toThrow(ValidationError)
    })

    it('rejects a transition to the same status', () => {
      const next = TableStatus.of(TABLE_STATUS.FREE)
      expect(() => TableStatus.of(TABLE_STATUS.FREE).transitionTo(next)).toThrow(ValidationError)
    })
  })
})
