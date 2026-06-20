import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ROLE } from '../../../../shared/constants/roles.constants'
import { PIN_REGEX, PIN_INVALID_MESSAGE } from '../../../../shared/constants/pin.constants'
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
  @Matches(PIN_REGEX, { message: PIN_INVALID_MESSAGE })
  @IsOptional()
  credential?: string
}
