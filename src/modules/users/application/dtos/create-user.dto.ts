import { IsEmail, IsIn, IsNotEmpty, IsString, Matches } from 'class-validator'
import { ROLE } from '../../../../shared/constants/roles.constants'
import { PIN_REGEX, PIN_INVALID_MESSAGE } from '../../../../shared/constants/pin.constants'
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
  @Matches(PIN_REGEX, { message: PIN_INVALID_MESSAGE })
  credential: string
}
