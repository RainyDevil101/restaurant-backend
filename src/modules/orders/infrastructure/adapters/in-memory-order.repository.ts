import { Injectable } from '@nestjs/common'
import { Order } from '../../domain/entities/order.entity'
import type { IOrderRepository, OrderFilters } from '../../domain/ports/order.repository.port'
import { ORDER_STATUS } from '../../domain/constants/order-status.constants'

// Mirrors frontend mockOrders — prices snapshot at order time
const SEED_ORDERS = [
  {
    id: 'order-1', tableId: 'table-2', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:10:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-1', productId: 'prod-1', productName: 'Guacamole',   quantity: 1, unitPrice: 85,  subtotal: 85,  notes: 'Sin chile' },
      { itemId: 'item-2', productId: 'prod-4', productName: 'Carne asada', quantity: 2, unitPrice: 220, subtotal: 440 },
      { itemId: 'item-3', productId: 'prod-10',productName: 'Cerveza',     quantity: 2, unitPrice: 55,  subtotal: 110 },
    ],
  },
  {
    id: 'order-2', tableId: 'table-3', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:30:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-4', productId: 'prod-2', productName: 'Sopa de tortilla',   quantity: 3, unitPrice: 75,  subtotal: 225 },
      { itemId: 'item-5', productId: 'prod-6', productName: 'Enchiladas verdes',  quantity: 3, unitPrice: 140, subtotal: 420 },
      { itemId: 'item-6', productId: 'prod-8', productName: 'Agua fresca',        quantity: 3, unitPrice: 35,  subtotal: 105 },
    ],
  },
  {
    id: 'order-3', tableId: 'table-4', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T12:00:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-7', productId: 'prod-5', productName: 'Pollo a la plancha', quantity: 2, unitPrice: 175, subtotal: 350 },
      { itemId: 'item-8', productId: 'prod-9', productName: 'Refresco',           quantity: 2, unitPrice: 30,  subtotal: 60  },
      { itemId: 'item-9', productId: 'prod-12',productName: 'Flan napolitano',    quantity: 2, unitPrice: 65,  subtotal: 130 },
    ],
  },
  {
    id: 'order-4', tableId: 'table-5', status: ORDER_STATUS.PENDING,
    createdAt: new Date('2026-06-01T12:20:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-10', productId: 'prod-3', productName: 'Flautas',      quantity: 1, unitPrice: 90, subtotal: 90 },
      { itemId: 'item-11', productId: 'prod-11',productName: 'Agua mineral', quantity: 2, unitPrice: 25, subtotal: 50 },
    ],
  },
  {
    id: 'order-5', tableId: 'table-6', status: ORDER_STATUS.IN_PROGRESS,
    createdAt: new Date('2026-06-01T12:15:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-12', productId: 'prod-4', productName: 'Carne asada',      quantity: 1, unitPrice: 220, subtotal: 220 },
      { itemId: 'item-13', productId: 'prod-6', productName: 'Enchiladas verdes',quantity: 1, unitPrice: 140, subtotal: 140 },
      { itemId: 'item-14', productId: 'prod-10',productName: 'Cerveza',          quantity: 2, unitPrice: 55,  subtotal: 110 },
    ],
  },
  {
    id: 'order-6', tableId: 'table-8', status: ORDER_STATUS.DELIVERED,
    createdAt: new Date('2026-06-01T11:45:00Z'), createdBy: 'user-1',
    items: [
      { itemId: 'item-15', productId: 'prod-5', productName: 'Pollo a la plancha',   quantity: 4, unitPrice: 175, subtotal: 700 },
      { itemId: 'item-16', productId: 'prod-8', productName: 'Agua fresca',          quantity: 4, unitPrice: 35,  subtotal: 140 },
      { itemId: 'item-17', productId: 'prod-13',productName: 'Pastel de chocolate',  quantity: 2, unitPrice: 70,  subtotal: 140 },
    ],
  },
]

@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private readonly store: Map<string, Order>

  constructor() {
    this.store = new Map(
      SEED_ORDERS.map((o) => [o.id, Order.rehydrate(o, o.id)]),
    )
  }

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    let orders = [...this.store.values()]
    if (filters?.tableId) orders = orders.filter((o) => o.tableId === filters.tableId)
    if (filters?.status)  orders = orders.filter((o) => o.status.value === filters.status)
    return orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order)
    return order
  }

  async update(order: Order): Promise<Order> {
    this.store.set(order.id, order)
    return order
  }
}
