import type { IProductRepository } from '../../../catalog/domain/ports/product.repository.port'
import type { ICategoryRepository } from '../../../catalog/domain/ports/category.repository.port'
import type { IAreaRepository } from '../../../venue/domain/ports/area.repository.port'
import type {
  ComandaLine,
  IComandaRenderer,
} from '../../domain/ports/comanda-renderer.port'
import { ORDER_LABELS, GENERAL_AREA_KEY } from '../constants/order-labels.constants'

export interface ComandaDto {
  areaId: string | null
  areaName: string
  preview: string
  escposBase64: string
}

export interface ComandaSourceItem {
  productId: string
  productName: string
  quantity: number
  notes?: string
}

export interface ComandaDeps {
  products: IProductRepository
  categories: ICategoryRepository
  areas: IAreaRepository
  renderer: IComandaRenderer
}

export interface ComandaContext {
  tableName: string
  dateTime: Date
  columns: number
  mergeLines: boolean
}

export async function assembleComandas(
  items: readonly ComandaSourceItem[],
  deps: ComandaDeps,
  ctx: ComandaContext,
): Promise<ComandaDto[]> {
  const productIds = [...new Set(items.map((item) => item.productId))]
  const products = await deps.products.findByIds(productIds)
  const productById = new Map(products.map((p) => [p.id, p]))
  const categoryById = new Map((await deps.categories.findAll()).map((c) => [c.id, c]))
  const areaById = new Map((await deps.areas.findAll()).map((a) => [a.id, a]))

  const groups = new Map<
    string,
    { areaId: string | null; areaName: string; lines: Map<string, ComandaLine> }
  >()
  let sequence = 0
  for (const item of items) {
    const product = productById.get(item.productId)
    const category = product ? categoryById.get(product.categoryId) : undefined
    const areaId = category?.areaId ?? null
    const key = areaId ?? GENERAL_AREA_KEY
    const areaName = areaId
      ? (areaById.get(areaId)?.name ?? ORDER_LABELS.GENERAL_AREA)
      : ORDER_LABELS.GENERAL_AREA

    let group = groups.get(key)
    if (!group) {
      group = { areaId, areaName, lines: new Map() }
      groups.set(key, group)
    }

    const lineKey = ctx.mergeLines ? item.productId : String(sequence++)
    const existing = group.lines.get(lineKey)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      group.lines.set(lineKey, {
        quantity: item.quantity,
        name: item.productName,
        notes: item.notes,
      })
    }
  }

  return [...groups.values()].map((group) => {
    const rendered = deps.renderer.render({
      areaName: group.areaName,
      tableName: ctx.tableName,
      dateTime: ctx.dateTime,
      lines: [...group.lines.values()],
      columns: ctx.columns,
    })
    return { areaId: group.areaId, areaName: group.areaName, ...rendered }
  })
}
