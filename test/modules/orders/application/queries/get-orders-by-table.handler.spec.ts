import { GetOrdersByTableHandler } from '@src/modules/orders/application/queries/get-orders-by-table.handler'
import { GetOrdersByTableQuery } from '@src/modules/orders/application/queries/get-orders-by-table.query'
import { Order } from '@src/modules/orders/domain/entities/order.entity'

const buildOrder = (id: string) =>
  Order.create(
    {
      tableId: 'table-1',
      createdBy: 'user-1',
      items: [{ productId: 'prod-1', productName: 'Tacos', quantity: 1, unitPrice: 50 }],
    },
    id,
  )

const buildDeps = () => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  }
  const handler = new GetOrdersByTableHandler(repo as any)
  return { handler, repo }
}

describe('GetOrdersByTableHandler', () => {
  it('queries the repository filtered by table id', async () => {
    const { handler, repo } = buildDeps()
    const orders = [buildOrder('order-1'), buildOrder('order-2')]
    repo.findAll.mockResolvedValue(orders)

    const result = await handler.execute(new GetOrdersByTableQuery('table-1'))

    expect(repo.findAll).toHaveBeenCalledWith({ tableId: 'table-1' })
    expect(result).toBe(orders)
  })

  it('returns an empty list when no orders match', async () => {
    const { handler, repo } = buildDeps()
    repo.findAll.mockResolvedValue([])

    const result = await handler.execute(new GetOrdersByTableQuery('table-9'))

    expect(result).toEqual([])
  })
})
