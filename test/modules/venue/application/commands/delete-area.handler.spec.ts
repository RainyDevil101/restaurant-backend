import { DeleteAreaHandler } from '@src/modules/venue/application/commands/delete-area.handler'
import { DeleteAreaCommand } from '@src/modules/venue/application/commands/delete-area.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import type { IAreaRepository } from '@src/modules/venue/domain/ports/area.repository.port'

describe('DeleteAreaHandler', () => {
  let areas: jest.Mocked<IAreaRepository>
  let handler: DeleteAreaHandler

  beforeEach(() => {
    areas = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteAreaHandler(areas)
  })

  it('deletes an existing area', async () => {
    areas.findById.mockResolvedValue(Area.create({ name: 'Cocina' }, 'area-1'))
    areas.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteAreaCommand('area-1'))

    expect(areas.delete).toHaveBeenCalledWith('area-1')
  })

  it('throws NotFoundError and does not delete when the area does not exist', async () => {
    areas.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteAreaCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(areas.delete).not.toHaveBeenCalled()
  })
})
