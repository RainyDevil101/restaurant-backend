import { ListCategoriesHandler } from '@src/modules/catalog/application/queries/list-categories.handler'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'

describe('ListCategoriesHandler', () => {
  let repo: jest.Mocked<ICategoryRepository>
  let handler: ListCategoriesHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ListCategoriesHandler(repo)
  })

  it('returns all categories from the repository', async () => {
    const categories = [Category.create({ name: 'Bebidas' }, 'cat-1'), Category.create({ name: 'Postres' }, 'cat-2')]
    repo.findAll.mockResolvedValue(categories)

    const result = await handler.execute()

    expect(repo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toBe(categories)
  })
})
