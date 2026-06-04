import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { envValidationSchema } from './config/env.validation';
import { ENV_DEFAULTS } from './shared/constants/env-defaults.constants';
import { BackupModule } from './database/backup/backup.module';
import { DatabaseModule } from './database/database.module';
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
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', ENV_DEFAULTS.THROTTLE_TTL),
            limit: config.get<number>('THROTTLE_LIMIT', ENV_DEFAULTS.THROTTLE_LIMIT),
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    BackupModule,
    UsersModule,
    AuthModule,
    VenueModule,
    CatalogModule,
    OrdersModule,
    BillingModule,
  ],
  providers: [
    AppLogger,
    { provide: APP_GUARD,       useClass: ThrottlerGuard },
    { provide: APP_FILTER,      useClass: DomainExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
  ],
})
export class AppModule {}
