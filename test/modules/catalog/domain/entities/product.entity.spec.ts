import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('Product', () => {
  const baseProps = {
    name: 'Tacos',
    description: 'Three tacos',
    price: 99.5,
    categoryId: 'cat-1',
    available: true,
  }

  describe('create', () => {
    it('creates a product with the given props and id', () => {
      const product = Product.create(baseProps, 'prod-1')
      expect(product.id).toBe('prod-1')
      expect(product.name).toBe('Tacos')
      expect(product.description).toBe('Three tacos')
      expect(product.price).toBe(99.5)
      expect(product.categoryId).toBe('cat-1')
      expect(product.available).toBe(true)
    })

    it('trims the name', () => {
      const product = Product.create({ ...baseProps, name: '  Tacos  ' }, 'prod-1')
      expect(product.name).toBe('Tacos')
    })

    it('allows an undefined description', () => {
      const product = Product.create({ ...baseProps, description: undefined }, 'prod-1')
      expect(product.description).toBeUndefined()
    })

    it('allows a price of zero', () => {
      const product = Product.create({ ...baseProps, price: 0 }, 'prod-1')
      expect(product.price).toBe(0)
    })

    it('throws ValidationError for an empty name', () => {
      expect(() => Product.create({ ...baseProps, name: '   ' }, 'prod-1')).toThrow(ValidationError)
    })

    it('throws ValidationError for a negative price', () => {
      expect(() => Product.create({ ...baseProps, price: -1 }, 'prod-1')).toThrow(ValidationError)
    })
  })

  describe('update', () => {
    it('returns a new product with the patched fields', () => {
      const product = Product.create(baseProps, 'prod-1')
      const updated = product.update({ name: 'Burritos', price: 120 })
      expect(updated.name).toBe('Burritos')
      expect(updated.price).toBe(120)
      expect(updated.id).toBe('prod-1')
    })

    it('does not clobber unset optional fields', () => {
      const product = Product.create(baseProps, 'prod-1')
      const updated = product.update({ price: 150 })
      expect(updated.name).toBe('Tacos')
      expect(updated.description).toBe('Three tacos')
      expect(updated.categoryId).toBe('cat-1')
      expect(updated.available).toBe(true)
    })

    it('does not overwrite description when it is left undefined in the patch', () => {
      const product = Product.create(baseProps, 'prod-1')
      const updated = product.update({ name: 'Burritos', description: undefined })
      expect(updated.description).toBe('Three tacos')
    })

    it('throws ValidationError when the patch produces an empty name', () => {
      const product = Product.create(baseProps, 'prod-1')
      expect(() => product.update({ name: '   ' })).toThrow(ValidationError)
    })

    it('throws ValidationError when the patch produces a negative price', () => {
      const product = Product.create(baseProps, 'prod-1')
      expect(() => product.update({ price: -5 })).toThrow(ValidationError)
    })
  })

  describe('toggleAvailability', () => {
    it('flips an available product to unavailable', () => {
      const product = Product.create({ ...baseProps, available: true }, 'prod-1')
      expect(product.toggleAvailability().available).toBe(false)
    })

    it('flips an unavailable product to available', () => {
      const product = Product.create({ ...baseProps, available: false }, 'prod-1')
      expect(product.toggleAvailability().available).toBe(true)
    })

    it('preserves all other fields', () => {
      const product = Product.create(baseProps, 'prod-1')
      const toggled = product.toggleAvailability()
      expect(toggled.name).toBe('Tacos')
      expect(toggled.description).toBe('Three tacos')
      expect(toggled.price).toBe(99.5)
      expect(toggled.categoryId).toBe('cat-1')
      expect(toggled.id).toBe('prod-1')
    })
  })
})
