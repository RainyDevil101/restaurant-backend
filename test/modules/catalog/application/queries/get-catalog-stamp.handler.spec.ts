import { GetCatalogStampHandler } from '@src/modules/catalog/application/queries/get-catalog-stamp.handler'
import type { ICategoryRepository } from '@src/modules/catalog/domain/ports/category.repository.port'
import type { IMenuRepository } from '@src/modules/catalog/domain/ports/menu.repository.port'
import type { IProductRepository } from '@src/modules/catalog/domain/ports/product.repository.port'

describe('GetCatalogStampHandler', () => {
  let products: jest.Mocked<IProductRepository>
  let categories: jest.Mocked<ICategoryRepository>
  let menus: jest.Mocked<IMenuRepository>
  let handler: GetCatalogStampHandler

  beforeEach(() => {
    products = { stamp: jest.fn() } as unknown as jest.Mocked<IProductRepository>
    categories = { stamp: jest.fn() } as unknown as jest.Mocked<ICategoryRepository>
    menus = { stamp: jest.fn() } as unknown as jest.Mocked<IMenuRepository>
    handler = new GetCatalogStampHandler(products, categories, menus)
  })

  it('aggregates the stamp of each catalog resource', async () => {
    products.stamp.mockResolvedValue({ count: 13, lastModified: '2026-06-03T10:00:00.000Z' })
    categories.stamp.mockResolvedValue({ count: 4, lastModified: '2026-06-02T09:00:00.000Z' })
    menus.stamp.mockResolvedValue({ count: 2, lastModified: '2026-06-01T08:00:00.000Z' })

    const result = await handler.execute()

    expect(products.stamp).toHaveBeenCalledTimes(1)
    expect(categories.stamp).toHaveBeenCalledTimes(1)
    expect(menus.stamp).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      products: { count: 13, lastModified: '2026-06-03T10:00:00.000Z' },
      categories: { count: 4, lastModified: '2026-06-02T09:00:00.000Z' },
      menus: { count: 2, lastModified: '2026-06-01T08:00:00.000Z' },
    })
  })

  it('propagates lastModified null for an empty table', async () => {
    products.stamp.mockResolvedValue({ count: 0, lastModified: null })
    categories.stamp.mockResolvedValue({ count: 4, lastModified: '2026-06-02T09:00:00.000Z' })
    menus.stamp.mockResolvedValue({ count: 0, lastModified: null })

    const result = await handler.execute()

    expect(result.products).toEqual({ count: 0, lastModified: null })
    expect(result.menus).toEqual({ count: 0, lastModified: null })
    expect(result.categories.lastModified).toBe('2026-06-02T09:00:00.000Z')
  })
})
