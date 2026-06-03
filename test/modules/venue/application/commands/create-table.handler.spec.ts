import { CreateTableHandler } from '@src/modules/venue/application/commands/create-table.handler'
import { CreateTableCommand } from '@src/modules/venue/application/commands/create-table.command'
import { Area } from '@src/modules/venue/domain/entities/area.entity'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

const buildDeps = () => {
  const tableRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn((table: Table) => Promise.resolve(table)),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const areaRepo = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(Area.create({ name: 'Comedor' }, 'area-1')),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const handler = new CreateTableHandler(tableRepo as any, areaRepo as any)
  return { handler, tableRepo, areaRepo }
}

const command = () =>
  new CreateTableCommand({ name: 'Mesa 1', capacity: 4, areaId: 'area-1' })

describe('CreateTableHandler', () => {
  it('saves a new free table inside the target area', async () => {
    const { handler, tableRepo } = buildDeps()

    const result = await handler.execute(command())

    expect(tableRepo.save).toHaveBeenCalledTimes(1)
    expect(result).toBeInstanceOf(Table)
    expect(result.name).toBe('Mesa 1')
    expect(result.capacity).toBe(4)
    expect(result.areaId).toBe('area-1')
    expect(result.status.value).toBe(TABLE_STATUS.FREE)
    expect(result.id).toBeTruthy()
  })

  it('throws NotFoundError when the area does not exist', async () => {
    const { handler, areaRepo, tableRepo } = buildDeps()
    areaRepo.findById.mockResolvedValue(null)

    await expect(handler.execute(command())).rejects.toThrow(NotFoundError)
    expect(tableRepo.save).not.toHaveBeenCalled()
  })
})
