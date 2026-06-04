import { ToggleProductAvailabilityHandler } from '@src/modules/catalog/application/commands/toggle-product-availability.handler'
import { ToggleProductAvailabilityCommand } from '@src/modules/catalog/application/commands/toggle-product-availability.command'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

describe('ToggleProductAvailabilityHandler', () => {
  let products: jest.Mocked<IProductRepository>
  let menus: jest.Mocked<IMenuRepository>
  let handler: ToggleProductAvailabilityHandler

  beforeEach(() => {
    products = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    menus = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ToggleProductAvailabilityHandler(products, menus)
  })

  it('deactivates an available product that is in no menu and persists it', async () => {
    const existing = Product.create(
      { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true },
      'prod-1',
    )
    products.findById.mockResolvedValue(existing)
    menus.findAll.mockResolvedValue([])
    products.update.mockImplementation((product) => Promise.resolve(product))

    const result = await handler.execute(new ToggleProductAvailabilityCommand('prod-1'))

    expect(products.findById).toHaveBeenCalledWith('prod-1')
    expect(products.update).toHaveBeenCalledTimes(1)
    const updated = products.update.mock.calls[0][0]
    expect(updated.available).toBe(false)
    expect(result).toBe(updated)
  })

  it('throws ValidationError and does not update when deactivating a product referenced by a menu', async () => {
    const existing = Product.create(
      { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true },
      'prod-1',
    )
    products.findById.mockResolvedValue(existing)
    menus.findAll.mockResolvedValue([
      Menu.create({ name: 'Combo del día', productIds: ['prod-1'], active: true }, 'menu-1'),
    ])

    await expect(
      handler.execute(new ToggleProductAvailabilityCommand('prod-1')),
    ).rejects.toThrow(ValidationError)
    expect(products.update).not.toHaveBeenCalled()
  })

  it('re-activates an unavailable product without checking menus', async () => {
    const existing = Product.create(
      { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: false },
      'prod-1',
    )
    products.findById.mockResolvedValue(existing)
    products.update.mockImplementation((product) => Promise.resolve(product))

    const result = await handler.execute(new ToggleProductAvailabilityCommand('prod-1'))

    expect(menus.findAll).not.toHaveBeenCalled()
    expect(products.update).toHaveBeenCalledTimes(1)
    const updated = products.update.mock.calls[0][0]
    expect(updated.available).toBe(true)
    expect(result).toBe(updated)
  })

  it('throws NotFoundError when the product does not exist', async () => {
    products.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new ToggleProductAvailabilityCommand('missing')),
    ).rejects.toThrow(NotFoundError)
    expect(products.update).not.toHaveBeenCalled()
  })
})
