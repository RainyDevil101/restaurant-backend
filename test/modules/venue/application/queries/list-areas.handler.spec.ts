import { ListAreasHandler } from '@src/modules/venue/application/queries/list-areas.handler'
import { ListAreasQuery } from '@src/modules/venue/application/queries/list-areas.query'
import { Area } from '@src/modules/venue/domain/entities/area.entity'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const handler = new ListAreasHandler(repo as any)
  return { handler, repo }
}

describe('ListAreasHandler', () => {
  it('returns all areas from the repository', async () => {
    const { handler, repo } = buildDeps()
    const areas = [Area.create({ name: 'Comedor' }, 'area-1'), Area.create({ name: 'Bar' }, 'area-2')]
    repo.findAll.mockResolvedValue(areas)

    const result = await handler.execute(new ListAreasQuery())

    expect(repo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toBe(areas)
  })
})
