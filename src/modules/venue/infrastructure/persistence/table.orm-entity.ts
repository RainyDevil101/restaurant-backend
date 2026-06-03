import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { TableStatusValue } from '../../domain/value-objects/table-status.vo'

@Entity('tables')
export class TableOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'int' })
  capacity!: number

  @Column({ type: 'varchar' })
  status!: TableStatusValue

  @Column({ type: 'varchar' })
  areaId!: string
}
