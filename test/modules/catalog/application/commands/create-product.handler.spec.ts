import { CreateProductHandler } from '@src/modules/catalog/application/commands/create-product.handler'
import { CreateProductCommand } from '@src/modules/catalog/application/commands/create-product.command'
import type { CreateProductDto } from '@src/modules/catalog/application/dtos/product.dto'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

describe('CreateProductHandler', () => {
  let productRepo: jest.Mocked<IProductRepository>
  let categoryRepo: jest.Mocked<ICategoryRepository>
  let handler: CreateProductHandler

  const dto: CreateProductDto = {
    name: 'Tacos',
    description: 'Three tacos',
    price: 99.5,
    categoryId: 'cat-1',
  }

  beforeEach(() => {
    productRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    categoryRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new CreateProductHandler(productRepo, categoryRepo)
  })

  it('saves a new available product when the category exists', async () => {
    categoryRepo.findById.mockResolvedValue(Category.create({ name: 'Comida', areaId: 'area-1' }, 'cat-1'))
    productRepo.save.mockImplementation((product) => Promise.resolve(product))

    const result = await handler.execute(new CreateProductCommand(dto))

    expect(categoryRepo.findById).toHaveBeenCalledWith('cat-1')
    expect(productRepo.save).toHaveBeenCalledTimes(1)
    const saved = productRepo.save.mock.calls[0][0]
    expect(saved.name).toBe('Tacos')
    expect(saved.price).toBe(99.5)
    expect(saved.categoryId).toBe('cat-1')
    expect(saved.available).toBe(true)
    expect(saved.id).toBeDefined()
    expect(result).toBe(saved)
  })

  it('throws NotFoundError when the category does not exist', async () => {
    categoryRepo.findById.mockResolvedValue(null)

    await expect(handler.execute(new CreateProductCommand(dto))).rejects.toThrow(NotFoundError)
    expect(productRepo.save).not.toHaveBeenCalled()
  })
})
