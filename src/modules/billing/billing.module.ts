import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthModule } from '../auth/auth.module'
import { OrdersModule } from '../orders/orders.module'
import { VenueModule } from '../venue/venue.module'
import { ConsolidateBillHandler } from './application/commands/consolidate-bill.handler'
import { ProcessPaymentHandler } from './application/commands/process-payment.handler'
import { GetBillByTableHandler } from './application/queries/get-bill-by-table.handler'
import { BILL_REPOSITORY } from './domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY } from './domain/ports/payment.repository.port'
import { BillingController } from './http/billing.controller'
import { InMemoryBillRepository } from './infrastructure/adapters/in-memory-bill.repository'
import { InMemoryPaymentRepository } from './infrastructure/adapters/in-memory-payment.repository'

@Module({
  imports: [CqrsModule, AuthModule, OrdersModule, VenueModule],
  controllers: [BillingController],
  providers: [
    ConsolidateBillHandler,
    ProcessPaymentHandler,
    GetBillByTableHandler,
    { provide: BILL_REPOSITORY, useClass: InMemoryBillRepository },
    { provide: PAYMENT_REPOSITORY, useClass: InMemoryPaymentRepository },
  ],
})
export class BillingModule {}
