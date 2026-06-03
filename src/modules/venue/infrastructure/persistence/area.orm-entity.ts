import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('areas')
export class AreaOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string
}
