import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { OrderItemProps } from '../../domain/entities/order.entity'
import type { OrderStatusValue } from '../../domain/value-objects/order-status.vo'
import { TableOrmEntity } from '../../../venue/infrastructure/persistence/table.orm-entity'
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity'

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @ManyToOne(() => TableOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tableId' })
  table!: TableOrmEntity

  @Column({ type: 'varchar' })
  tableId!: string

  @ManyToOne(() => UserOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdBy' })
  creator!: UserOrmEntity

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

  @ManyToOne(() => UserOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelledBy' })
  canceller!: UserOrmEntity | null

  @Column({ type: 'varchar', nullable: true })
  cancelledBy!: string | null

  @Column({ type: 'varchar', nullable: true })
  cancellationReason!: string | null

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null
}
