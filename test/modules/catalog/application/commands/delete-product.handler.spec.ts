import { DeleteProductHandler } from '@src/modules/catalog/application/commands/delete-product.handler'
import { DeleteProductCommand } from '@src/modules/catalog/application/commands/delete-product.command'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

describe('DeleteProductHandler', () => {
  let repo: jest.Mocked<IProductRepository>
  let handler: DeleteProductHandler

  const existing = Product.create(
    { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true },
    'prod-1',
  )

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteProductHandler(repo)
  })

  it('deletes the product when it exists', async () => {
    repo.findById.mockResolvedValue(existing)
    repo.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteProductCommand('prod-1'))

    expect(repo.findById).toHaveBeenCalledWith('prod-1')
    expect(repo.delete).toHaveBeenCalledWith('prod-1')
  })

  it('throws NotFoundError when the product does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteProductCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
