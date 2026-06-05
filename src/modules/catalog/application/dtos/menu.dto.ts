import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class MenuItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string

  @IsInt()
  @Min(1)
  quantity: number
}

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items: MenuItemDto[]

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
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  @IsOptional()
  items?: MenuItemDto[]

  @IsNumber()
  @Min(0)
  @Max(999_999)
  @IsOptional()
  price?: number
}
