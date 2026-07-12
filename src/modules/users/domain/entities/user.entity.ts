import { Entity } from '../../../../shared/domain/entity.base'
import { ROLE } from '../../../../shared/constants/roles.constants'

export type UserRole = (typeof ROLE)[keyof typeof ROLE]

export interface UserProps {
  name: string
  email: string
  hashedCredential: string
  role: UserRole
  active: boolean
  isOwner: boolean
  failedAttempts?: number
  lockedUntil?: Date | null
}

export class User extends Entity {
  readonly name: string
  readonly email: string
  readonly hashedCredential: string
  readonly role: UserRole
  readonly active: boolean
  readonly isOwner: boolean
  readonly failedAttempts: number
  readonly lockedUntil: Date | null

  /** Meseros (role M) authenticate with a numeric PIN; others use a password. */
  get isPin(): boolean {
    return this.role === ROLE.MESERO
  }

  private constructor(props: UserProps, id: string) {
    super(id)
    this.name = props.name
    this.email = props.email
    this.hashedCredential = props.hashedCredential
    this.role = props.role
    this.active = props.active
    this.isOwner = props.isOwner
    this.failedAttempts = props.failedAttempts ?? 0
    this.lockedUntil = props.lockedUntil ?? null
  }

  static create(props: UserProps, id: string): User {
    return new User(props, id)
  }

  isLocked(now: Date): boolean {
    return this.lockedUntil !== null && this.lockedUntil.getTime() > now.getTime()
  }

  registerFailedAttempt(now: Date, freeAttempts: number, backoffSeconds: readonly number[]): User {
    const attempts = this.failedAttempts + 1
    const penaltyIndex = attempts - freeAttempts - 1
    let lockedUntil = this.lockedUntil
    if (penaltyIndex >= 0 && backoffSeconds.length > 0) {
      const seconds = backoffSeconds[Math.min(penaltyIndex, backoffSeconds.length - 1)]
      lockedUntil = new Date(now.getTime() + seconds * 1000)
    }
    return User.create({ ...this.toProps(), failedAttempts: attempts, lockedUntil }, this.id)
  }

  registerSuccessfulLogin(): User {
    return this.unlock()
  }

  unlock(): User {
    return User.create({ ...this.toProps(), failedAttempts: 0, lockedUntil: null }, this.id)
  }

  deactivate(): User {
    return User.create({ ...this.toProps(), active: false }, this.id)
  }

  withHashedCredential(hashedCredential: string): User {
    return User.create({ ...this.toProps(), hashedCredential }, this.id)
  }

  private toProps(): UserProps {
    return {
      name: this.name,
      email: this.email,
      hashedCredential: this.hashedCredential,
      role: this.role,
      active: this.active,
      isOwner: this.isOwner,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
    }
  }
}
