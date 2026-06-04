import { DeleteAreaHandler } from '@src/modules/venue/application/commands/delete-area.handler'
import { DeleteAreaCommand } from '@src/modules/venue/application/commands/delete-area.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'
import type { IAreaRepository } from '@src/modules/venue/domain/ports/area.repository.port'
import type { ITableRepository } from '@src/modules/venue/domain/ports/table.repository.port'

describe('DeleteAreaHandler', () => {
  let areas: jest.Mocked<IAreaRepository>
  let tables: jest.Mocked<ITableRepository>
  let handler: DeleteAreaHandler

  beforeEach(() => {
    areas = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    tables = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    handler = new DeleteAreaHandler(areas, tables)
  })

  it('deletes an existing area when it has no tables', async () => {
    areas.findById.mockResolvedValue(Area.create({ name: 'Comedor' }, 'area-1'))
    tables.findAll.mockResolvedValue([])
    areas.delete.mockResolvedValue(undefined)

    await handler.execute(new DeleteAreaCommand('area-1'))

    expect(tables.findAll).toHaveBeenCalledWith('area-1')
    expect(areas.delete).toHaveBeenCalledWith('area-1')
  })

  it('throws NotFoundError and does not delete when the area does not exist', async () => {
    areas.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteAreaCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(areas.delete).not.toHaveBeenCalled()
  })

  it('throws ValidationError and does not delete when the area still has tables', async () => {
    areas.findById.mockResolvedValue(Area.create({ name: 'Comedor' }, 'area-1'))
    tables.findAll.mockResolvedValue([
      Table.create({ name: 'Mesa 1', capacity: 4, status: TABLE_STATUS.FREE, areaId: 'area-1' }, 'table-1'),
    ])

    await expect(handler.execute(new DeleteAreaCommand('area-1'))).rejects.toThrow(ValidationError)
    expect(areas.delete).not.toHaveBeenCalled()
  })
})
