import { UpdateTableHandler } from '@src/modules/venue/application/commands/update-table.handler'
import { UpdateTableCommand } from '@src/modules/venue/application/commands/update-table.command'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

const existingTable = () =>
  Table.create({ name: 'Mesa 1', capacity: 4, status: TABLE_STATUS.FREE }, 'table-1')

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn((table: Table) => Promise.resolve(table)),
    delete: jest.fn(),
  }
  const handler = new UpdateTableHandler(repo as any)
  return { handler, repo }
}

describe('UpdateTableHandler', () => {
  it('updates the table with the provided fields', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(existingTable())

    const result = await handler.execute(
      new UpdateTableCommand('table-1', { name: 'Mesa renombrada', capacity: 6 }),
    )

    expect(repo.update).toHaveBeenCalledTimes(1)
    expect(result.name).toBe('Mesa renombrada')
    expect(result.capacity).toBe(6)
    expect(result.id).toBe('table-1')
  })

  it('throws NotFoundError when the table does not exist', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new UpdateTableCommand('missing', { name: 'Mesa 2' })),
    ).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
