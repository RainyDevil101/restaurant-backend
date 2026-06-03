import { DeleteTableHandler } from '@src/modules/venue/application/commands/delete-table.handler'
import { DeleteTableCommand } from '@src/modules/venue/application/commands/delete-table.command'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  }
  const handler = new DeleteTableHandler(repo as any)
  return { handler, repo }
}

describe('DeleteTableHandler', () => {
  it('deletes an existing table by id', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(
      Table.create(
        { name: 'Mesa 1', capacity: 4, status: TABLE_STATUS.FREE, areaId: 'area-1' },
        'table-1',
      ),
    )

    await handler.execute(new DeleteTableCommand('table-1'))

    expect(repo.delete).toHaveBeenCalledWith('table-1')
  })

  it('throws NotFoundError when the table does not exist', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(null)

    await expect(handler.execute(new DeleteTableCommand('missing'))).rejects.toThrow(NotFoundError)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
