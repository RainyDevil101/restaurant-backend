import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ENVS } from '../config/env.config'
import { sslOptionFor } from './ssl'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>(ENVS.DATABASE_URL)
        const isDev = config.get<string>(ENVS.NODE_ENV) !== 'production'
        return {
          type: 'postgres',
          url,
          ssl: sslOptionFor(url),
          autoLoadEntities: true,
          synchronize: isDev,
          retryAttempts: 0,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
