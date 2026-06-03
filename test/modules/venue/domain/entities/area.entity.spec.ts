import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('Area', () => {
  describe('create', () => {
    it('creates an area with the given name and id', () => {
      const area = Area.create({ name: 'Comedor' }, 'area-1')
      expect(area.id).toBe('area-1')
      expect(area.name).toBe('Comedor')
    })

    it('trims surrounding whitespace from the name', () => {
      const area = Area.create({ name: '  Bar  ' }, 'area-2')
      expect(area.name).toBe('Bar')
    })

    it('throws ValidationError when the name is empty', () => {
      expect(() => Area.create({ name: '' }, 'area-3')).toThrow(ValidationError)
    })

    it('throws ValidationError when the name is only whitespace', () => {
      expect(() => Area.create({ name: '   ' }, 'area-4')).toThrow(ValidationError)
    })
  })

  describe('rename', () => {
    it('returns a new area with the updated name and same id', () => {
      const area = Area.create({ name: 'Comedor' }, 'area-1')
      const renamed = area.rename('Terraza')
      expect(renamed.name).toBe('Terraza')
      expect(renamed.id).toBe('area-1')
    })

    it('throws ValidationError when renamed to an empty name', () => {
      const area = Area.create({ name: 'Comedor' }, 'area-1')
      expect(() => area.rename('  ')).toThrow(ValidationError)
    })
  })

  describe('equals', () => {
    it('is true for areas sharing the same id', () => {
      const a = Area.create({ name: 'Comedor' }, 'area-1')
      const b = Area.create({ name: 'Bar' }, 'area-1')
      expect(a.equals(b)).toBe(true)
    })

    it('is false for areas with different ids', () => {
      const a = Area.create({ name: 'Comedor' }, 'area-1')
      const b = Area.create({ name: 'Comedor' }, 'area-2')
      expect(a.equals(b)).toBe(false)
    })
  })
})
