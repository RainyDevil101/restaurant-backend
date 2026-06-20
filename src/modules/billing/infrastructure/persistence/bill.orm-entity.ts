import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { BillItemProps } from '../../domain/entities/bill.entity'
import { numericTransformer } from '../../../../database/numeric.transformer'
import { TableOrmEntity } from '../../../venue/infrastructure/persistence/table.orm-entity'

@Entity('bills')
export class BillOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @ManyToOne(() => TableOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tableId' })
  table!: TableOrmEntity

  @Column({ type: 'varchar' })
  tableId!: string

  @Column({ type: 'jsonb' })
  items!: BillItemProps[]

  @Column({ type: 'jsonb', nullable: true })
  waiterIds!: string[] | null

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  total!: number

  @Column({ type: 'timestamptz' })
  createdAt!: Date

  @Column({ type: 'boolean', default: false })
  paid!: boolean
}
