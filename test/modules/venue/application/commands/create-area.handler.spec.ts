import { CreateAreaHandler } from '@src/modules/venue/application/commands/create-area.handler'
import { CreateAreaCommand } from '@src/modules/venue/application/commands/create-area.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn((area: Area) => Promise.resolve(area)),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const handler = new CreateAreaHandler(repo as any)
  return { handler, repo }
}

describe('CreateAreaHandler', () => {
  it('saves a new area built from the dto', async () => {
    const { handler, repo } = buildDeps()

    const result = await handler.execute(new CreateAreaCommand({ name: 'Terraza' }))

    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(result).toBeInstanceOf(Area)
    expect(result.name).toBe('Terraza')
    expect(result.id).toBeTruthy()
  })
})
