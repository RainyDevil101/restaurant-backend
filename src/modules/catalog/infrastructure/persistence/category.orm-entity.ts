import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar', nullable: true })
  areaId!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
