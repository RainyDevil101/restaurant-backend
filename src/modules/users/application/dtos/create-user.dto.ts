import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ROLE } from '../../../../shared/constants/roles.constants'
import type { UserRole } from '../../domain/entities/user.entity'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsIn([ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN])
  role: UserRole

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  credential: string
}
