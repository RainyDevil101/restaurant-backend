import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { User, type UserRole } from '../../domain/entities/user.entity'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import { ROLE } from '../../../../shared/constants/roles.constants'

interface SeedEntry {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  credential: string
}

// Mirrors src/shared/mocks/users.ts from the frontend — dev only
const SEED: SeedEntry[] = [
  { id: 'user-1', name: 'Ana',     email: 'ana@subito.mx',    role: ROLE.MESERO, active: true,  credential: '1234'  },
  { id: 'user-2', name: 'Carlos',  email: 'carlos@subito.mx', role: ROLE.CAJERO, active: true,  credential: '1234'  },
  { id: 'user-3', name: 'Roberto', email: 'admin@subito.mx',  role: ROLE.ADMIN,  active: true,  credential: 'admin' },
  { id: 'user-4', name: 'Pedro',   email: 'pedro@subito.mx',  role: ROLE.MESERO, active: false, credential: '5678'  },
]

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly store: Map<string, User>

  constructor() {
    this.store = new Map(
      SEED.map(({ credential, ...props }) => [
        props.id,
        User.create(
          { ...props, hashedCredential: bcrypt.hashSync(credential, 10) },
          props.id,
        ),
      ]),
    )
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async findAll(): Promise<User[]> {
    return [...this.store.values()]
  }

  async save(user: User): Promise<User> {
    this.store.set(user.id, user)
    return user
  }

  async update(user: User): Promise<User> {
    this.store.set(user.id, user)
    return user
  }
}
