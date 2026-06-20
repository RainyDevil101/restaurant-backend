import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { PaymentMethodValue } from '../../domain/entities/payment.entity'
import { numericTransformer } from '../../../../database/numeric.transformer'
import { BillOrmEntity } from './bill.orm-entity'
import { TableOrmEntity } from '../../../venue/infrastructure/persistence/table.orm-entity'

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @ManyToOne(() => BillOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'billId' })
  bill!: BillOrmEntity

  @Column({ type: 'varchar' })
  billId!: string

  @ManyToOne(() => TableOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tableId' })
  table!: TableOrmEntity

  @Column({ type: 'varchar' })
  tableId!: string

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  amount!: number

  @Column({ type: 'varchar' })
  method!: PaymentMethodValue

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  change!: number

  @Column({ type: 'timestamptz' })
  paidAt!: Date
}
