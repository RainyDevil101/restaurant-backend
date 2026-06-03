import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string
}
