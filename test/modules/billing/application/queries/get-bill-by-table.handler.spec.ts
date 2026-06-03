import { GetBillByTableHandler } from '@src/modules/billing/application/queries/get-bill-by-table.handler'
import { GetBillByTableQuery } from '@src/modules/billing/application/queries/get-bill-by-table.query'
import { Bill } from '@src/modules/billing/domain/entities/bill.entity'
import type { IBillRepository } from '@src/modules/billing/domain/ports/bill.repository.port'
import { NotFoundError } from '@src/shared/domain/errors/not-found.error'

describe('GetBillByTableHandler', () => {
  let repo: jest.Mocked<IBillRepository>
  let handler: GetBillByTableHandler

  beforeEach(() => {
    repo = {
      findByTable: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    }
    handler = new GetBillByTableHandler(repo)
  })

  it('returns the bill found for the table', async () => {
    const bill = Bill.create(
      { tableId: 'table-1', items: [], total: 0, createdAt: new Date() },
      'bill-1',
    )
    repo.findByTable.mockResolvedValue(bill)

    const result = await handler.execute(new GetBillByTableQuery('table-1'))

    expect(result).toBe(bill)
    expect(repo.findByTable).toHaveBeenCalledWith('table-1')
  })

  it('throws NotFoundError when no bill exists for the table', async () => {
    repo.findByTable.mockResolvedValue(null)

    await expect(handler.execute(new GetBillByTableQuery('table-1'))).rejects.toThrow(NotFoundError)
  })
})
