import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { sslOptionFor } from './ssl'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL')
        return {
          type: 'postgres',
          url,
          ssl: sslOptionFor(url),
          autoLoadEntities: true,
          synchronize: true,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
