import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ROLE } from '../../../../shared/constants/roles.constants'
import type { UserRole } from '../../domain/entities/user.entity'

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsIn([ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN])
  @IsOptional()
  role?: UserRole

  @IsBoolean()
  @IsOptional()
  active?: boolean

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  @IsOptional()
  credential?: string
}
