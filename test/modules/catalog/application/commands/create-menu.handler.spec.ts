import { CreateMenuHandler } from '@src/modules/catalog/application/commands/create-menu.handler'
import { CreateMenuCommand } from '@src/modules/catalog/application/commands/create-menu.command'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('CreateMenuHandler', () => {
  let repo: jest.Mocked<IMenuRepository>
  let handler: CreateMenuHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new CreateMenuHandler(repo)
  })

  it('saves a new inactive menu built from the dto and returns it', async () => {
    repo.save.mockImplementation((menu) => Promise.resolve(menu))

    const result = await handler.execute(
      new CreateMenuCommand({ name: 'Menu del dia', productIds: ['prod-1', 'prod-2'] }),
    )

    expect(repo.save).toHaveBeenCalledTimes(1)
    const saved = repo.save.mock.calls[0][0]
    expect(saved).toBeInstanceOf(Menu)
    expect(saved.name).toBe('Menu del dia')
    expect(saved.productIds).toEqual(['prod-1', 'prod-2'])
    expect(saved.active).toBe(false)
    expect(saved.id).toEqual(expect.any(String))
    expect(result).toBe(saved)
  })
})
