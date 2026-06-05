import type { UserRole } from '../../domain/entities/user.entity'

export interface UserDto {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  isOwner: boolean
}
