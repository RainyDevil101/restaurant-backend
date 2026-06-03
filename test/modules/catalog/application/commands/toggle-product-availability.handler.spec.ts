import { ToggleProductAvailabilityHandler } from '@src/modules/catalog/application/commands/toggle-product-availability.handler'
import { ToggleProductAvailabilityCommand } from '@src/modules/catalog/application/commands/toggle-product-availability.command'
import { Product } from '@src/modules/catalog/domain/entities/product.entity'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

describe('ToggleProductAvailabilityHandler', () => {
  let repo: jest.Mocked<IProductRepository>
  let handler: ToggleProductAvailabilityHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ToggleProductAvailabilityHandler(repo)
  })

  it('toggles availability of the found product and persists it', async () => {
    const existing = Product.create(
      { name: 'Tacos', price: 99.5, categoryId: 'cat-1', available: true },
      'prod-1',
    )
    repo.findById.mockResolvedValue(existing)
    repo.update.mockImplementation((product) => Promise.resolve(product))

    const result = await handler.execute(new ToggleProductAvailabilityCommand('prod-1'))

    expect(repo.findById).toHaveBeenCalledWith('prod-1')
    expect(repo.update).toHaveBeenCalledTimes(1)
    const updated = repo.update.mock.calls[0][0]
    expect(updated.available).toBe(false)
    expect(result).toBe(updated)
  })

  it('throws NotFoundError when the product does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new ToggleProductAvailabilityCommand('missing')),
    ).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
