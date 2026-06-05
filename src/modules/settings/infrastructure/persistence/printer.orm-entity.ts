import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('printers')
export class PrinterOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar' })
  connection!: string

  @Column({ type: 'int' })
  paperWidth!: number

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean
}
