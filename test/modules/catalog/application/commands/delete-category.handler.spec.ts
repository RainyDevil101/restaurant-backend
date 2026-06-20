import { DeleteCategoryHandler } from '@src/modules/catalog/application/commands/delete-category.handler'
import { DeleteCategoryCommand } from '@src/modules/catalog/application/commands/delete-category.command'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'

describe('DeleteCategoryHandler', () => {
  let categories: jest.Mocked<ICategoryRepository>
  let products: jest.Mocked<IProductRepository>
  let handler: DeleteCategoryHandler

  beforeEach(() => {
    categories = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    products = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteCategoryHandler(categories, products)
  })

  it('deletes the category by id when it exists and has no products', async () => {
    categories.findById.mockResolvedValue(Category.create({ name: 'Bebidas', areaId: 'area-1' }, 'cat-1'))
    products.findAll.mockResolvedValue([])
    categories.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteCategoryCommand('cat-1'))

    expect(categories.findById).toHaveBeenCalledWith('cat-1')
    expect(products.findAll).toHaveBeenCalledWith({ categoryId: 'cat-1' })
    expect(categories.delete).toHaveBeenCalledWith('cat-1')
  })

  it('throws NotFoundError and does not delete when the category does not exist', async () => {
    categories.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteCategoryCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(products.findAll).not.toHaveBeenCalled()
    expect(categories.delete).not.toHaveBeenCalled()
  })

  it('throws ValidationError and does not delete when the category still has products', async () => {
    categories.findById.mockResolvedValue(Category.create({ name: 'Bebidas', areaId: 'area-1' }, 'cat-1'))
    products.findAll.mockResolvedValue([
      Product.create({ name: 'Coca', price: 10, categoryId: 'cat-1', available: true }, 'prod-1'),
    ])

    await expect(handler.execute(new DeleteCategoryCommand('cat-1'))).rejects.toThrow(ValidationError)
    expect(categories.delete).not.toHaveBeenCalled()
  })
})
