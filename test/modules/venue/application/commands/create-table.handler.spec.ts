import { CreateTableHandler } from '@src/modules/venue/application/commands/create-table.handler'
import { CreateTableCommand } from '@src/modules/venue/application/commands/create-table.command'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'

const buildDeps = () => {
  const tableRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn((table: Table) => Promise.resolve(table)),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const handler = new CreateTableHandler(tableRepo as any)
  return { handler, tableRepo }
}

const command = () => new CreateTableCommand({ name: 'Mesa 1', capacity: 4 })

describe('CreateTableHandler', () => {
  it('saves a new free table', async () => {
    const { handler, tableRepo } = buildDeps()

    const result = await handler.execute(command())

    expect(tableRepo.save).toHaveBeenCalledTimes(1)
    expect(result).toBeInstanceOf(Table)
    expect(result.name).toBe('Mesa 1')
    expect(result.capacity).toBe(4)
    expect(result.status.value).toBe(TABLE_STATUS.FREE)
    expect(result.id).toBeTruthy()
  })
})
