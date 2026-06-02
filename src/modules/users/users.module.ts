import { Module } from '@nestjs/common'
import { InMemoryUserRepository } from './infrastructure/adapters/in-memory-user.repository'
import { USER_REPOSITORY } from './domain/ports/user.repository.port'

@Module({
  providers: [{ provide: USER_REPOSITORY, useClass: InMemoryUserRepository }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
