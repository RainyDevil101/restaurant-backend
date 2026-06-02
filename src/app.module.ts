import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { VenueModule } from './modules/venue/venue.module';
import { DomainExceptionFilter } from './shared/infrastructure/exceptions/domain-exception.filter';
import { HttpLoggingInterceptor } from './shared/infrastructure/logging/http-logging.interceptor';
import { AppLogger } from './shared/infrastructure/logging/app-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    UsersModule,
    AuthModule,
    VenueModule,
    CatalogModule,
    OrdersModule,
    BillingModule,
  ],
  providers: [
    AppLogger,
    { provide: APP_FILTER,      useClass: DomainExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
  ],
})
export class AppModule {}
