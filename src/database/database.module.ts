import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

function requiresSsl(databaseUrl: string): boolean {
  const host = new URL(databaseUrl).hostname
  return host !== 'localhost' && host !== '127.0.0.1'
}

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
          ssl: requiresSsl(url) ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: true,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
