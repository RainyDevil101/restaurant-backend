import type { User, UserRole } from '../../domain/entities/user.entity'

export interface UserDto {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  isOwner: boolean
  lockedUntil: string | null
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    isOwner: user.isOwner,
    lockedUntil: user.lockedUntil ? user.lockedUntil.toISOString() : null,
  }
}
