import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsString({ each: true })
  productIds: string[]

  @IsNumber()
  @Min(0)
  @Max(999_999)
  price: number
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

  @IsNumber()
  @Min(0)
  @Max(999_999)
  @IsOptional()
  price?: number
}
