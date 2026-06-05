import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CreatePrinterHandler } from './application/commands/create-printer.handler'
import { DeletePrinterHandler } from './application/commands/delete-printer.handler'
import { UpdatePrinterHandler } from './application/commands/update-printer.handler'
import { UpdateReceiptSettingsHandler } from './application/commands/update-receipt-settings.handler'
import { ListPrintersHandler } from './application/queries/list-printers.handler'
import { GetReceiptSettingsHandler } from './application/queries/get-receipt-settings.handler'
import { PRINTER_REPOSITORY } from './domain/ports/printer.repository.port'
import { RECEIPT_SETTINGS_REPOSITORY } from './domain/ports/receipt-settings.repository.port'
import { SettingsController } from './http/settings.controller'
import { TypeormPrinterRepository } from './infrastructure/adapters/typeorm-printer.repository'
import { TypeormReceiptSettingsRepository } from './infrastructure/adapters/typeorm-receipt-settings.repository'
import { PrinterOrmEntity } from './infrastructure/persistence/printer.orm-entity'
import { ReceiptSettingsOrmEntity } from './infrastructure/persistence/receipt-settings.orm-entity'

const HANDLERS = [
  ListPrintersHandler, CreatePrinterHandler, UpdatePrinterHandler, DeletePrinterHandler,
  GetReceiptSettingsHandler, UpdateReceiptSettingsHandler,
]

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    TypeOrmModule.forFeature([PrinterOrmEntity, ReceiptSettingsOrmEntity]),
  ],
  controllers: [SettingsController],
  providers: [
    ...HANDLERS,
    { provide: PRINTER_REPOSITORY, useClass: TypeormPrinterRepository },
    { provide: RECEIPT_SETTINGS_REPOSITORY, useClass: TypeormReceiptSettingsRepository },
  ],
})
export class SettingsModule {}
