import { CreateCategoryHandler } from '@src/modules/catalog/application/commands/create-category.handler'
import { CreateCategoryCommand } from '@src/modules/catalog/application/commands/create-category.command'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'

describe('CreateCategoryHandler', () => {
  let repo: jest.Mocked<ICategoryRepository>
  let handler: CreateCategoryHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new CreateCategoryHandler(repo)
  })

  it('saves a new category built from the dto name and returns it', async () => {
    repo.save.mockImplementation((category) => Promise.resolve(category))

    const result = await handler.execute(new CreateCategoryCommand({ name: 'Bebidas' }))

    expect(repo.save).toHaveBeenCalledTimes(1)
    const saved = repo.save.mock.calls[0][0]
    expect(saved).toBeInstanceOf(Category)
    expect(saved.name).toBe('Bebidas')
    expect(saved.id).toEqual(expect.any(String))
    expect(result).toBe(saved)
  })
})
