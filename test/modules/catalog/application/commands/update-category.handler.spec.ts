import { UpdateCategoryHandler } from '@src/modules/catalog/application/commands/update-category.handler'
import { UpdateCategoryCommand } from '@src/modules/catalog/application/commands/update-category.command'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'

describe('UpdateCategoryHandler', () => {
  let repo: jest.Mocked<ICategoryRepository>
  let handler: UpdateCategoryHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new UpdateCategoryHandler(repo)
  })

  it('renames the category when a name is provided and persists the change', async () => {
    repo.findById.mockResolvedValue(Category.create({ name: 'Bebidas' }, 'cat-1'))
    repo.update.mockImplementation((category) => Promise.resolve(category))

    const result = await handler.execute(new UpdateCategoryCommand('cat-1', { name: 'Postres' }))

    expect(repo.findById).toHaveBeenCalledWith('cat-1')
    expect(repo.update).toHaveBeenCalledTimes(1)
    const updated = repo.update.mock.calls[0][0]
    expect(updated.name).toBe('Postres')
    expect(updated.id).toBe('cat-1')
    expect(result).toBe(updated)
  })

  it('persists the existing category unchanged when no name is provided', async () => {
    const existing = Category.create({ name: 'Bebidas' }, 'cat-1')
    repo.findById.mockResolvedValue(existing)
    repo.update.mockImplementation((category) => Promise.resolve(category))

    await handler.execute(new UpdateCategoryCommand('cat-1', {}))

    expect(repo.update).toHaveBeenCalledWith(existing)
  })

  it('throws NotFoundError when the category does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new UpdateCategoryCommand('missing', { name: 'X' }))).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
