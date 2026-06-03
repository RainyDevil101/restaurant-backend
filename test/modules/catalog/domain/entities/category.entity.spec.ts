import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('Category', () => {
  describe('create', () => {
    it('creates a category with the given name and id', () => {
      const category = Category.create({ name: 'Bebidas' }, 'cat-1')
      expect(category.id).toBe('cat-1')
      expect(category.name).toBe('Bebidas')
    })

    it('trims the name', () => {
      const category = Category.create({ name: '  Bebidas  ' }, 'cat-1')
      expect(category.name).toBe('Bebidas')
    })

    it('throws ValidationError for an empty name', () => {
      expect(() => Category.create({ name: '   ' }, 'cat-1')).toThrow(ValidationError)
    })
  })

  describe('rename', () => {
    it('returns a new category with the new name and same id', () => {
      const category = Category.create({ name: 'Bebidas' }, 'cat-1')
      const renamed = category.rename('Postres')
      expect(renamed.name).toBe('Postres')
      expect(renamed.id).toBe('cat-1')
    })

    it('trims the new name', () => {
      const category = Category.create({ name: 'Bebidas' }, 'cat-1')
      expect(category.rename('  Postres  ').name).toBe('Postres')
    })

    it('throws ValidationError when renaming to an empty name', () => {
      const category = Category.create({ name: 'Bebidas' }, 'cat-1')
      expect(() => category.rename('   ')).toThrow(ValidationError)
    })
  })
})
