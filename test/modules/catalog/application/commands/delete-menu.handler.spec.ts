import { DeleteMenuHandler } from '@src/modules/catalog/application/commands/delete-menu.handler'
import { DeleteMenuCommand } from '@src/modules/catalog/application/commands/delete-menu.command'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('DeleteMenuHandler', () => {
  let repo: jest.Mocked<IMenuRepository>
  let handler: DeleteMenuHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteMenuHandler(repo)
  })

  it('deletes the menu by id when it exists', async () => {
    repo.findById.mockResolvedValue(Menu.create({ name: 'Menu', productIds: [], active: false }, 'menu-1'))
    repo.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteMenuCommand('menu-1'))

    expect(repo.findById).toHaveBeenCalledWith('menu-1')
    expect(repo.delete).toHaveBeenCalledWith('menu-1')
  })

  it('throws NotFoundError and does not delete when the menu does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteMenuCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
