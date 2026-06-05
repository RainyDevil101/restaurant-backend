import { IsOptional, IsString } from 'class-validator'

export class UpdateReceiptSettingsDto {
  @IsString()
  @IsOptional()
  businessName?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  footer?: string
}
