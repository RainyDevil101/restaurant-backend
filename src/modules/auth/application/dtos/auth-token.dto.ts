import type { UserRole } from '../../../users/domain/entities/user.entity'

export interface AuthUserDto {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  isOwner: boolean
}

export class AuthTokenDto {
  readonly accessToken: string
  readonly tokenType = 'Bearer'
  readonly user: AuthUserDto

  constructor(accessToken: string, user: AuthUserDto) {
    this.accessToken = accessToken
    this.user = user
  }
}
