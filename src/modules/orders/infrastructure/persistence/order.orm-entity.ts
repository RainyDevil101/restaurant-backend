import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { OrderItemProps } from '../../domain/entities/order.entity'
import type { OrderStatusValue } from '../../domain/value-objects/order-status.vo'

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  tableId!: string

  @Column({ type: 'varchar' })
  createdBy!: string

  @Column({ type: 'timestamptz' })
  createdAt!: Date

  @Column({ type: 'varchar' })
  status!: OrderStatusValue

  @Column({ type: 'boolean', default: false })
  paid!: boolean

  @Column({ type: 'jsonb' })
  items!: OrderItemProps[]
}
