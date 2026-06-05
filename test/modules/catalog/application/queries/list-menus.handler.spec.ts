import { ListMenusHandler } from '@src/modules/catalog/application/queries/list-menus.handler'
import { Menu } from '@src/modules/catalog/domain/entities/menu.entity'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'

describe('ListMenusHandler', () => {
  let repo: jest.Mocked<IMenuRepository>
  let handler: ListMenusHandler

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new ListMenusHandler(repo)
  })

  it('returns all menus from the repository', async () => {
    const menus = [
      Menu.create({ name: 'Menu A', items: [], active: true, price: 100 }, 'menu-1'),
      Menu.create({ name: 'Menu B', items: [], active: false, price: 150 }, 'menu-2'),
    ]
    repo.findAll.mockResolvedValue(menus)

    const result = await handler.execute()

    expect(repo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toBe(menus)
  })
})
