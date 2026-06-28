import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CatalogModule } from '../catalog/catalog.module'
import { OrdersModule } from '../orders/orders.module'
import { VenueModule } from '../venue/venue.module'
import { SettingsModule } from '../settings/settings.module'
import { ConsolidateBillHandler } from './application/commands/consolidate-bill.handler'
import { ProcessPaymentHandler } from './application/commands/process-payment.handler'
import { GetBillByTableHandler } from './application/queries/get-bill-by-table.handler'
import { GetAllPaymentsHandler } from './application/queries/get-all-payments.handler'
import { GetPrecheckHandler } from './application/queries/get-precheck.handler'
import { GetPaymentReceiptHandler } from './application/queries/get-payment-receipt.handler'
import { GetPaymentComandaHandler } from './application/queries/get-payment-comanda.handler'
import { BILL_REPOSITORY } from './domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY } from './domain/ports/payment.repository.port'
import { RECEIPT_RENDERER } from './domain/ports/receipt-renderer.port'
import { BillingController } from './http/billing.controller'
import { TypeormBillRepository } from './infrastructure/adapters/typeorm-bill.repository'
import { TypeormPaymentRepository } from './infrastructure/adapters/typeorm-payment.repository'
import { EscPosReceiptRenderer } from './infrastructure/adapters/escpos-receipt-renderer'
import { BillOrmEntity } from './infrastructure/persistence/bill.orm-entity'
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity'

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    CatalogModule,
    OrdersModule,
    VenueModule,
    SettingsModule,
    TypeOrmModule.forFeature([BillOrmEntity, PaymentOrmEntity]),
  ],
  controllers: [BillingController],
  providers: [
    ConsolidateBillHandler,
    ProcessPaymentHandler,
    GetBillByTableHandler,
    GetAllPaymentsHandler,
    GetPrecheckHandler,
    GetPaymentReceiptHandler,
    GetPaymentComandaHandler,
    { provide: BILL_REPOSITORY, useClass: TypeormBillRepository },
    { provide: PAYMENT_REPOSITORY, useClass: TypeormPaymentRepository },
    { provide: RECEIPT_RENDERER, useClass: EscPosReceiptRenderer },
  ],
})
export class BillingModule {}
