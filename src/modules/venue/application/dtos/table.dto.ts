import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { TABLE_STATUS } from '../../domain/constants/table-status.constants'
import type { TableStatusValue } from '../../domain/value-objects/table-status.vo'

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(1)
  capacity: number
}

export class UpdateTableDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number
}

export class UpdateTableStatusDto {
  @IsIn(Object.values(TABLE_STATUS))
  status: TableStatusValue
}
