import { UpdateMenuHandler } from '@src/modules/catalog/application/commands/update-menu.handler'
import { UpdateMenuCommand } from '@src/modules/catalog/application/commands/update-menu.command'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('UpdateMenuHandler', () => {
  let repo: jest.Mocked<IMenuRepository>
  let handler: UpdateMenuHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new UpdateMenuHandler(repo)
  })

  it('applies the patch to the existing menu and persists it', async () => {
    repo.findById.mockResolvedValue(Menu.create({ name: 'Old', productIds: ['prod-1'], active: true }, 'menu-1'))
    repo.update.mockImplementation((menu) => Promise.resolve(menu))

    const result = await handler.execute(
      new UpdateMenuCommand('menu-1', { name: 'New', productIds: ['prod-2', 'prod-3'] }),
    )

    expect(repo.findById).toHaveBeenCalledWith('menu-1')
    expect(repo.update).toHaveBeenCalledTimes(1)
    const updated = repo.update.mock.calls[0][0]
    expect(updated.name).toBe('New')
    expect(updated.productIds).toEqual(['prod-2', 'prod-3'])
    expect(updated.active).toBe(true)
    expect(updated.id).toBe('menu-1')
    expect(result).toBe(updated)
  })

  it('keeps untouched fields when the patch is partial', async () => {
    repo.findById.mockResolvedValue(Menu.create({ name: 'Old', productIds: ['prod-1'], active: true }, 'menu-1'))
    repo.update.mockImplementation((menu) => Promise.resolve(menu))

    await handler.execute(new UpdateMenuCommand('menu-1', { name: 'Renamed' }))

    const updated = repo.update.mock.calls[0][0]
    expect(updated.name).toBe('Renamed')
    expect(updated.productIds).toEqual(['prod-1'])
  })

  it('throws NotFoundError when the menu does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new UpdateMenuCommand('missing', { name: 'X' }))).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
