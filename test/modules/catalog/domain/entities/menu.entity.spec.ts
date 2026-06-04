import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('Menu', () => {
  const baseProps = {
    name: 'Comida corrida',
    productIds: ['prod-1', 'prod-2'],
    active: true,
    price: 120,
  }

  describe('create', () => {
    it('creates a menu with the given props and id', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      expect(menu.id).toBe('menu-1')
      expect(menu.name).toBe('Comida corrida')
      expect(menu.productIds).toEqual(['prod-1', 'prod-2'])
      expect(menu.active).toBe(true)
      expect(menu.price).toBe(120)
    })

    it('throws ValidationError for a negative price', () => {
      expect(() => Menu.create({ ...baseProps, price: -1 }, 'menu-1')).toThrow(ValidationError)
    })

    it('trims the name', () => {
      const menu = Menu.create({ ...baseProps, name: '  Comida corrida  ' }, 'menu-1')
      expect(menu.name).toBe('Comida corrida')
    })

    it('copies the productIds array instead of sharing the reference', () => {
      const ids = ['prod-1']
      const menu = Menu.create({ ...baseProps, productIds: ids }, 'menu-1')
      ids.push('prod-99')
      expect(menu.productIds).toEqual(['prod-1'])
    })

    it('throws ValidationError for an empty name', () => {
      expect(() => Menu.create({ ...baseProps, name: '   ' }, 'menu-1')).toThrow(ValidationError)
    })
  })

  describe('update', () => {
    it('returns a new menu with the patched fields', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const updated = menu.update({ name: 'Especial', productIds: ['prod-3'], price: 200 })
      expect(updated.name).toBe('Especial')
      expect(updated.productIds).toEqual(['prod-3'])
      expect(updated.price).toBe(200)
      expect(updated.id).toBe('menu-1')
    })

    it('does not clobber unset fields', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const updated = menu.update({ name: 'Especial' })
      expect(updated.productIds).toEqual(['prod-1', 'prod-2'])
      expect(updated.active).toBe(true)
    })

    it('keeps the active flag because it is not patchable via update', () => {
      const menu = Menu.create({ ...baseProps, active: false }, 'menu-1')
      const updated = menu.update({ name: 'Especial' })
      expect(updated.active).toBe(false)
    })

    it('throws ValidationError when the patch produces an empty name', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      expect(() => menu.update({ name: '   ' })).toThrow(ValidationError)
    })
  })

  describe('toggleActive', () => {
    it('flips an active menu to inactive', () => {
      const menu = Menu.create({ ...baseProps, active: true }, 'menu-1')
      expect(menu.toggleActive().active).toBe(false)
    })

    it('flips an inactive menu to active', () => {
      const menu = Menu.create({ ...baseProps, active: false }, 'menu-1')
      expect(menu.toggleActive().active).toBe(true)
    })

    it('preserves the name and productIds', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const toggled = menu.toggleActive()
      expect(toggled.name).toBe('Comida corrida')
      expect(toggled.productIds).toEqual(['prod-1', 'prod-2'])
      expect(toggled.id).toBe('menu-1')
    })
  })
})
