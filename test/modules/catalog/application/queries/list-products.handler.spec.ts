import { ListProductsHandler } from '@src/modules/catalog/application/queries/list-products.handler'
import { ListProductsQuery } from '@src/modules/catalog/application/queries/list-products.query'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'

describe('ListProductsHandler', () => {
  let repo: jest.Mocked<IProductRepository>
  let handler: ListProductsHandler

  const products = [
    Product.create({ name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true }, 'prod-1'),
    Product.create({ name: 'Agua', price: 25, categoryId: 'cat-2', available: false }, 'prod-2'),
  ]

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ListProductsHandler(repo)
  })

  it('returns all products from the repository', async () => {
    repo.findAll.mockResolvedValue(products)

    const result = await handler.execute(new ListProductsQuery())

    expect(repo.findAll).toHaveBeenCalledWith(undefined)
    expect(result).toBe(products)
  })

  it('forwards the filters to the repository', async () => {
    repo.findAll.mockResolvedValue([])

    const filters = { categoryId: 'cat-1', available: true }
    await handler.execute(new ListProductsQuery(filters))

    expect(repo.findAll).toHaveBeenCalledWith(filters)
  })
})
