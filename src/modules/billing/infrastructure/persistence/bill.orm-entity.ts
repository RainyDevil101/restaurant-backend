import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { BillItemProps } from '../../domain/entities/bill.entity'
import { numericTransformer } from '../../../../database/numeric.transformer'

@Entity('bills')
export class BillOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  tableId!: string

  @Column({ type: 'jsonb' })
  items!: BillItemProps[]

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  total!: number

  @Column({ type: 'timestamptz' })
  createdAt!: Date

  @Column({ type: 'boolean', default: false })
  paid!: boolean
}
