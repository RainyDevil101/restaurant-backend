import { ListTablesHandler } from '@src/modules/venue/application/queries/list-tables.handler'
import { ListTablesQuery } from '@src/modules/venue/application/queries/list-tables.query'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
  const handler = new ListTablesHandler(repo as any)
  return { handler, repo }
}

const sampleTables = () => [
  Table.create({ name: 'Mesa 1', capacity: 4, status: TABLE_STATUS.FREE }, 'table-1'),
]

describe('ListTablesHandler', () => {
  it('returns all tables', async () => {
    const { handler, repo } = buildDeps()
    const tables = sampleTables()
    repo.findAll.mockResolvedValue(tables)

    const result = await handler.execute(new ListTablesQuery())

    expect(repo.findAll).toHaveBeenCalledWith()
    expect(result).toBe(tables)
  })
})
