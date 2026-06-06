import { UpdateTableStatusHandler } from '@src/modules/venue/application/commands/update-table-status.handler'
import { UpdateTableStatusCommand } from '@src/modules/venue/application/commands/update-table-status.command'
import { Table } from '@src/modules/venue/domain/entities/table.entity'
import { TABLE_STATUS } from '@src/modules/venue/domain/constants/table-status.constants'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'
import { ValidationError } from '@src/shared/domain/errors/validation.error'

const tableWithStatus = (status: (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS]) =>
  Table.create({ name: 'Mesa 1', capacity: 4, status }, 'table-1')

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn((table: Table) => Promise.resolve(table)),
    delete: jest.fn(),
  }
  const handler = new UpdateTableStatusHandler(repo as any)
  return { handler, repo }
}

describe('UpdateTableStatusHandler', () => {
  it('persists an allowed transition', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(tableWithStatus(TABLE_STATUS.FREE))

    const result = await handler.execute(
      new UpdateTableStatusCommand('table-1', TABLE_STATUS.OCCUPIED),
    )

    expect(repo.update).toHaveBeenCalledTimes(1)
    expect(result.status.value).toBe(TABLE_STATUS.OCCUPIED)
    expect(result.id).toBe('table-1')
  })

  it('rejects an invalid transition with ValidationError', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(tableWithStatus(TABLE_STATUS.FREE))

    await expect(
      handler.execute(new UpdateTableStatusCommand('table-1', TABLE_STATUS.PENDING_PAYMENT)),
    ).rejects.toThrow(ValidationError)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when the table does not exist', async () => {
    const { handler, repo } = buildDeps()
    repo.findById.mockResolvedValue(null)

    await expect(
      handler.execute(new UpdateTableStatusCommand('missing', TABLE_STATUS.OCCUPIED)),
    ).rejects.toThrow(NotFoundError)
    expect(repo.update).not.toHaveBeenCalled()
  })
})
