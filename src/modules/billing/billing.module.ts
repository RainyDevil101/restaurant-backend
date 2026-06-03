import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { OrdersModule } from '../orders/orders.module'
import { VenueModule } from '../venue/venue.module'
import { ConsolidateBillHandler } from './application/commands/consolidate-bill.handler'
import { ProcessPaymentHandler } from './application/commands/process-payment.handler'
import { GetBillByTableHandler } from './application/queries/get-bill-by-table.handler'
import { BILL_REPOSITORY } from './domain/ports/bill.repository.port'
import { PAYMENT_REPOSITORY } from './domain/ports/payment.repository.port'
import { BillingController } from './http/billing.controller'
import { TypeormBillRepository } from './infrastructure/adapters/typeorm-bill.repository'
import { TypeormPaymentRepository } from './infrastructure/adapters/typeorm-payment.repository'
import { BillOrmEntity } from './infrastructure/persistence/bill.orm-entity'
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity'

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    OrdersModule,
    VenueModule,
    TypeOrmModule.forFeature([BillOrmEntity, PaymentOrmEntity]),
  ],
  controllers: [BillingController],
  providers: [
    ConsolidateBillHandler,
    ProcessPaymentHandler,
    GetBillByTableHandler,
    { provide: BILL_REPOSITORY, useClass: TypeormBillRepository },
    { provide: PAYMENT_REPOSITORY, useClass: TypeormPaymentRepository },
  ],
})
export class BillingModule {}
