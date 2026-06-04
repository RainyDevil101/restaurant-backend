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

  @Column({ type: 'varchar', nullable: true })
  cancelledBy!: string | null

  @Column({ type: 'varchar', nullable: true })
  cancellationReason!: string | null

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null
}
