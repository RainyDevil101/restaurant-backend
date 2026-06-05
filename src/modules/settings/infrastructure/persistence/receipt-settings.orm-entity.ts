import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('receipt_settings')
export class ReceiptSettingsOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  businessName!: string

  @Column({ type: 'varchar', default: '' })
  address!: string

  @Column({ type: 'varchar' })
  footer!: string
}
