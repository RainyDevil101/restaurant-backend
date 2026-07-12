import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { UserRole } from '../../domain/entities/user.entity'

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar', unique: true })
  email!: string

  @Column({ type: 'varchar' })
  hashedCredential!: string

  @Column({ type: 'varchar' })
  role!: UserRole

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ type: 'boolean', default: false })
  isOwner!: boolean

  @Column({ type: 'int', default: 0 })
  failedAttempts!: number

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null
}
