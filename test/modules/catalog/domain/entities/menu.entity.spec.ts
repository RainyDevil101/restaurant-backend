import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('Menu', () => {
  const baseProps = {
    name: 'Comida corrida',
    items: [
      { productId: 'prod-1', quantity: 1 },
      { productId: 'prod-2', quantity: 1 },
    ],
    active: true,
    price: 120,
  }

  describe('create', () => {
    it('creates a menu with the given props and id', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      expect(menu.id).toBe('menu-1')
      expect(menu.name).toBe('Comida corrida')
      expect(menu.items).toEqual([
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 1 },
      ])
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

    it('copies the items array instead of sharing the reference', () => {
      const items = [{ productId: 'prod-1', quantity: 1 }]
      const menu = Menu.create({ ...baseProps, items }, 'menu-1')
      items.push({ productId: 'prod-99', quantity: 1 })
      expect(menu.items).toEqual([{ productId: 'prod-1', quantity: 1 }])
    })

    it('throws ValidationError for an empty name', () => {
      expect(() => Menu.create({ ...baseProps, name: '   ' }, 'menu-1')).toThrow(ValidationError)
    })
  })

  describe('update', () => {
    it('returns a new menu with the patched fields', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const updated = menu.update({ name: 'Especial', items: [{ productId: 'prod-3', quantity: 1 }], price: 200 })
      expect(updated.name).toBe('Especial')
      expect(updated.items).toEqual([{ productId: 'prod-3', quantity: 1 }])
      expect(updated.price).toBe(200)
      expect(updated.id).toBe('menu-1')
    })

    it('does not clobber unset fields', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const updated = menu.update({ name: 'Especial' })
      expect(updated.items).toEqual([
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 1 },
      ])
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

    it('preserves the name and items', () => {
      const menu = Menu.create(baseProps, 'menu-1')
      const toggled = menu.toggleActive()
      expect(toggled.name).toBe('Comida corrida')
      expect(toggled.items).toEqual([
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 1 },
      ])
      expect(toggled.id).toBe('menu-1')
    })
  })
})
