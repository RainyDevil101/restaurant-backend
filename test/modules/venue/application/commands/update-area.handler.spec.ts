import { UpdateAreaHandler } from '@src/modules/venue/application/commands/update-area.handler'
import { UpdateAreaCommand } from '@src/modules/venue/application/commands/update-area.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn((area: Area) => Promise.resolve(area)),
    delete: jest.fn(),
  }
  const handler = new UpdateAreaHandler(repo as any)
  return { handler, repo }
}

describe('UpdateAreaHandler', () => {
  it('renames the area when a new name is provided', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(Area.create({ name: 'Comedor' }, 'area-1'))

    const result = await handler.execute(new UpdateAreaCommand('area-1', { name: 'Terraza' }))

    expect(repo.update).toHaveBeenCalledTimes(1)
    expect(result.name).toBe('Terraza')
    expect(result.id).toBe('area-1')
  })

  it('persists the area unchanged when no name is provided', async () => {
    const { handler, repo } = buildDeps()
    const existing = Area.create({ name: 'Comedor' }, 'area-1')
    repo.findById.mockResolvedValue(existing)

    const result = await handler.execute(new UpdateAreaCommand('area-1', {}))

    expect(repo.update).toHaveBeenCalledWith(existing)
    expect(result.name).toBe('Comedor')
  })

  it('throws NotFoundError when the area does not exist', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new UpdateAreaCommand('missing', { name: 'Terraza' })),
    ).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
