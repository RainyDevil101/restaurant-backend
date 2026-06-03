import { Column, Entity, PrimaryColumn } from 'typeorm'

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
}
