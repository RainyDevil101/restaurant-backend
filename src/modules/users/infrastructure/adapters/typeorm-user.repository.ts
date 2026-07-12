import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../domain/entities/user.entity'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import { UserOrmEntity } from '../persistence/user.orm-entity'

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  private toDomain(row: UserOrmEntity): User {
    return User.create(
      {
        name: row.name,
        email: row.email,
        hashedCredential: row.hashedCredential,
        role: row.role,
        active: row.active,
        isOwner: row.isOwner ?? false,
        failedAttempts: row.failedAttempts ?? 0,
        lockedUntil: row.lockedUntil ?? null,
      },
      row.id,
    )
  }

  private toOrm(user: User): UserOrmEntity {
    const row = new UserOrmEntity()
    row.id = user.id
    row.name = user.name
    row.email = user.email
    row.hashedCredential = user.hashedCredential
    row.role = user.role
    row.active = user.active
    row.isOwner = user.isOwner
    row.failedAttempts = user.failedAttempts
    row.lockedUntil = user.lockedUntil
    return row
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOneBy({ id })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOneBy({ email })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<User[]> {
    const rows = await this.repo.find()
    return rows.map((row) => this.toDomain(row))
  }

  async save(user: User): Promise<User> {
    await this.repo.save(this.toOrm(user))
    return user
  }

  async update(user: User): Promise<User> {
    await this.repo.save(this.toOrm(user))
    return user
  }
}
