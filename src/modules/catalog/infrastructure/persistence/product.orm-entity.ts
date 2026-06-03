import { Column, Entity, PrimaryColumn } from 'typeorm'
import { numericTransformer } from '../../../../database/numeric.transformer'

@Entity('products')
export class ProductOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar', nullable: true })
  description!: string | null

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  price!: number

  @Column({ type: 'varchar' })
  categoryId!: string

  @Column({ type: 'boolean' })
  available!: boolean
}
