import { ToggleMenuActiveHandler } from '@src/modules/catalog/application/commands/toggle-menu-active.handler'
import { ToggleMenuActiveCommand } from '@src/modules/catalog/application/commands/toggle-menu-active.command'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('ToggleMenuActiveHandler', () => {
  let repo: jest.Mocked<IMenuRepository>
  let handler: ToggleMenuActiveHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ToggleMenuActiveHandler(repo)
  })

  it('activates an inactive menu and persists it', async () => {
    repo.findById.mockResolvedValue(Menu.create({ name: 'Menu', productIds: [], active: false }, 'menu-1'))
    repo.update.mockImplementation((menu) => Promise.resolve(menu))

    const result = await handler.execute(new ToggleMenuActiveCommand('menu-1'))

    expect(repo.findById).toHaveBeenCalledWith('menu-1')
    const updated = repo.update.mock.calls[0][0]
    expect(updated.active).toBe(true)
    expect(updated.id).toBe('menu-1')
    expect(result).toBe(updated)
  })

  it('deactivates an active menu and persists it', async () => {
    repo.findById.mockResolvedValue(Menu.create({ name: 'Menu', productIds: [], active: true }, 'menu-1'))
    repo.update.mockImplementation((menu) => Promise.resolve(menu))

    await handler.execute(new ToggleMenuActiveCommand('menu-1'))

    const updated = repo.update.mock.calls[0][0]
    expect(updated.active).toBe(false)
  })

  it('throws NotFoundError when the menu does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new ToggleMenuActiveCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
