import { DeleteProductHandler } from '@src/modules/catalog/application/commands/delete-product.handler'
import { DeleteProductCommand } from '@src/modules/catalog/application/commands/delete-product.command'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('DeleteProductHandler', () => {
  let products: jest.Mocked<IProductRepository>
  let menus: jest.Mocked<IMenuRepository>
  let handler: DeleteProductHandler

  const existing = Product.create(
    { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true },
    'prod-1',
  )

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
    handler = new DeleteProductHandler(products, menus)
  })

  it('deletes the product when it exists and is in no menu', async () => {
    products.findById.mockResolvedValue(existing)
    menus.findAll.mockResolvedValue([])
    products.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteProductCommand('prod-1'))

    expect(products.findById).toHaveBeenCalledWith('prod-1')
    expect(products.delete).toHaveBeenCalledWith('prod-1')
  })

  it('throws NotFoundError and does not delete when the product does not exist', async () => {
    products.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteProductCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(products.delete).not.toHaveBeenCalled()
  })

  it('throws ValidationError and does not delete when the product is referenced by a menu', async () => {
    products.findById.mockResolvedValue(existing)
    menus.findAll.mockResolvedValue([
      Menu.create({ name: 'Combo del día', productIds: ['prod-1'], active: true }, 'menu-1'),
    ])

    await expect(handler.execute(new DeleteProductCommand('prod-1'))).rejects.toThrow(ValidationError)
    expect(products.delete).not.toHaveBeenCalled()
  })
})
