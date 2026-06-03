import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const baseProps = () => ({
  name: 'Mesa 1',
  capacity: 4,
  status: TABLE_STATUS.FREE,
  areaId: 'area-1',
})

describe('Table', () => {
  describe('create', () => {
    it('creates a table with the given props and id', () => {
      const table = Table.create(baseProps(), 'table-1')
      expect(table.id).toBe('table-1')
      expect(table.name).toBe('Mesa 1')
      expect(table.capacity).toBe(4)
      expect(table.areaId).toBe('area-1')
      expect(table.status.value).toBe(TABLE_STATUS.FREE)
    })

    it('trims surrounding whitespace from the name', () => {
      const table = Table.create({ ...baseProps(), name: '  Mesa 2  ' }, 'table-1')
      expect(table.name).toBe('Mesa 2')
    })

    it('throws ValidationError when the name is empty', () => {
      expect(() => Table.create({ ...baseProps(), name: '   ' }, 'table-1')).toThrow(ValidationError)
    })

    it('throws ValidationError when capacity is below one', () => {
      expect(() => Table.create({ ...baseProps(), capacity: 0 }, 'table-1')).toThrow(ValidationError)
    })

    it('throws ValidationError when the status is unknown', () => {
      expect(() => Table.create({ ...baseProps(), status: 'reservada' as never }, 'table-1')).toThrow(
        ValidationError,
      )
    })
  })

  describe('updateStatus', () => {
    it('moves through a valid transition keeping the same id', () => {
      const table = Table.create(baseProps(), 'table-1')
      const occupied = table.updateStatus(TABLE_STATUS.OCCUPIED)
      expect(occupied.status.value).toBe(TABLE_STATUS.OCCUPIED)
      expect(occupied.id).toBe('table-1')
    })

    it('throws ValidationError on an invalid transition', () => {
      const table = Table.create(baseProps(), 'table-1')
      expect(() => table.updateStatus(TABLE_STATUS.PENDING_PAYMENT)).toThrow(ValidationError)
    })

    it('throws ValidationError when the target status is unknown', () => {
      const table = Table.create(baseProps(), 'table-1')
      expect(() => table.updateStatus('reservada' as never)).toThrow(ValidationError)
    })
  })

  describe('update', () => {
    it('applies the provided fields and preserves the rest', () => {
      const table = Table.create(baseProps(), 'table-1')
      const updated = table.update({ name: 'Mesa renombrada', capacity: 6 })
      expect(updated.name).toBe('Mesa renombrada')
      expect(updated.capacity).toBe(6)
      expect(updated.areaId).toBe('area-1')
      expect(updated.status.value).toBe(TABLE_STATUS.FREE)
      expect(updated.id).toBe('table-1')
    })

    it('ignores undefined fields in the patch', () => {
      const table = Table.create(baseProps(), 'table-1')
      const updated = table.update({ name: undefined, areaId: 'area-2' })
      expect(updated.name).toBe('Mesa 1')
      expect(updated.areaId).toBe('area-2')
    })

    it('throws ValidationError when the patch sets an invalid capacity', () => {
      const table = Table.create(baseProps(), 'table-1')
      expect(() => table.update({ capacity: 0 })).toThrow(ValidationError)
    })
  })
})
