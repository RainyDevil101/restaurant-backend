import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsString({ each: true })
  productIds: string[]
}

export class UpdateMenuDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[]
}
