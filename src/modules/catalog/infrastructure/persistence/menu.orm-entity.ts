import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { numericTransformer } from '../../../../database/numeric.transformer'

@Entity('menus')
export class MenuOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'jsonb' })
  productIds!: string[]

  @Column({ type: 'boolean' })
  active!: boolean

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer, default: 0 })
  price!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
