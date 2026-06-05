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
}

export class User extends Entity {
  readonly name: string
  readonly email: string
  readonly hashedCredential: string
  readonly role: UserRole
  readonly active: boolean
  readonly isOwner: boolean

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
  }

  static create(props: UserProps, id: string): User {
    return new User(props, id)
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
    }
  }
}
