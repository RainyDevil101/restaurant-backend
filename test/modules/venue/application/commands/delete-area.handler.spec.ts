import { DeleteAreaHandler } from '@src/modules/venue/application/commands/delete-area.handler'
import { DeleteAreaCommand } from '@src/modules/venue/application/commands/delete-area.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  }
  const handler = new DeleteAreaHandler(repo as any)
  return { handler, repo }
}

describe('DeleteAreaHandler', () => {
  it('deletes an existing area by id', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(Area.create({ name: 'Comedor' }, 'area-1'))

    await handler.execute(new DeleteAreaCommand('area-1'))

    expect(repo.delete).toHaveBeenCalledWith('area-1')
  })

  it('throws NotFoundError when the area does not exist', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteAreaCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
