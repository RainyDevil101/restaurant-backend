import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import type { PaperWidth, PrinterConnection } from '../../domain/entities/printer.entity'

export class CreatePrinterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsIn(['usb', 'bluetooth'])
  connection: PrinterConnection

  @IsIn([58, 80])
  paperWidth: PaperWidth

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}

export class UpdatePrinterDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsIn(['usb', 'bluetooth'])
  @IsOptional()
  connection?: PrinterConnection

  @IsIn([58, 80])
  @IsOptional()
  paperWidth?: PaperWidth

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
