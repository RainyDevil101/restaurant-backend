import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  areaId?: string
}

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  areaId?: string
}
