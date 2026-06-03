import { UpdateProductHandler } from '@src/modules/catalog/application/commands/update-product.handler'
import { UpdateProductCommand } from '@src/modules/catalog/application/commands/update-product.command'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

describe('UpdateProductHandler', () => {
  let repo: jest.Mocked<IProductRepository>
  let handler: UpdateProductHandler

  const existing = Product.create(
    { name: 'Tacos', description: 'Three tacos', price: 99.5, categoryId: 'cat-1', available: true },
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
    handler = new UpdateProductHandler(repo)
  })

  it('updates the found product and persists it', async () => {
    repo.findById.mockResolvedValue(existing)
    repo.update.mockImplementation((product) => Promise.resolve(product))

    const result = await handler.execute(new UpdateProductCommand('prod-1', { name: 'Burritos' }))

    expect(repo.findById).toHaveBeenCalledWith('prod-1')
    expect(repo.update).toHaveBeenCalledTimes(1)
    const updated = repo.update.mock.calls[0][0]
    expect(updated.name).toBe('Burritos')
    expect(updated.price).toBe(99.5)
    expect(result).toBe(updated)
  })

  it('throws NotFoundError when the product does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new UpdateProductCommand('missing', { name: 'Burritos' })),
    ).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
