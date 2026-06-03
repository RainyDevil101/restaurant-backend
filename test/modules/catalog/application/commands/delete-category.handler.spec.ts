import { DeleteCategoryHandler } from '@src/modules/catalog/application/commands/delete-category.handler'
import { DeleteCategoryCommand } from '@src/modules/catalog/application/commands/delete-category.command'
import { Category } from '@src/modules/catalog/domain/entities/category.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'

describe('DeleteCategoryHandler', () => {
  let repo: jest.Mocked<ICategoryRepository>
  let handler: DeleteCategoryHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteCategoryHandler(repo)
  })

  it('deletes the category by id when it exists', async () => {
    repo.findById.mockResolvedValue(Category.create({ name: 'Bebidas' }, 'cat-1'))
    repo.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteCategoryCommand('cat-1'))

    expect(repo.findById).toHaveBeenCalledWith('cat-1')
    expect(repo.delete).toHaveBeenCalledWith('cat-1')
  })

  it('throws NotFoundError and does not delete when the category does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteCategoryCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
