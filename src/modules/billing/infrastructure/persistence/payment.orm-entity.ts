import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { PaymentMethodValue } from '../../domain/entities/payment.entity'
import { numericTransformer } from '../../../../database/numeric.transformer'

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  billId!: string

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
