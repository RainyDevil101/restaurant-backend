import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, type FindOptionsWhere } from 'typeorm'
import { Order } from '../../domain/entities/order.entity'
import type { IOrderRepository, OrderFilters } from '../../domain/ports/order.repository.port'
import { OrderOrmEntity } from '../persistence/order.orm-entity'

@Injectable()
export class TypeormOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repo: Repository<OrderOrmEntity>,
  ) {}

  private toDomain(row: OrderOrmEntity): Order {
    return Order.rehydrate(
      {
        tableId: row.tableId,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        status: row.status,
        paid: row.paid,
        items: row.items,
      },
      row.id,
    )
  }

  private toOrm(order: Order): OrderOrmEntity {
    const row = new OrderOrmEntity()
    row.id = order.id
    row.tableId = order.tableId
    row.createdBy = order.createdBy
    row.createdAt = order.createdAt
    row.status = order.status.value
    row.paid = order.paid
    row.items = [...order.items]
    return row
  }

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const where: FindOptionsWhere<OrderOrmEntity> = {}
    if (filters?.tableId) where.tableId = filters.tableId
    if (filters?.status) where.status = filters.status
    if (filters?.paid !== undefined) where.paid = filters.paid
    const rows = await this.repo.find({ where, order: { createdAt: 'ASC' } })
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async save(order: Order): Promise<Order> {
    await this.repo.save(this.toOrm(order))
    return order
  }

  async update(order: Order): Promise<Order> {
    await this.repo.save(this.toOrm(order))
    return order
  }
}
