import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ORDER_STATUS } from '../../domain/constants/order-status.constants'
import type { OrderStatusValue } from '../../domain/value-objects/order-status.vo'

export class OrderItemInputDto {
  @IsString()
  @IsNotEmpty()
  productId: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsString()
  @IsOptional()
  notes?: string
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  tableId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[]
}

export class UpdateOrderStatusDto {
  @IsIn(Object.values(ORDER_STATUS))
  status: OrderStatusValue
}
