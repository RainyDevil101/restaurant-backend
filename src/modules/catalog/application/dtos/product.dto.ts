import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(0)
  @Max(999_999)
  price: number

  @IsString()
  @IsNotEmpty()
  categoryId: string
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(0)
  @Max(999_999)
  @IsOptional()
  price?: number

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryId?: string

  @IsBoolean()
  @IsOptional()
  available?: boolean
}
