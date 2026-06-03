import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AuthModule } from '../auth/auth.module'
import { InMemoryUserRepository } from './infrastructure/adapters/in-memory-user.repository'
import { USER_REPOSITORY } from './domain/ports/user.repository.port'
import { ListUsersHandler } from './application/queries/list-users.handler'
import { CreateUserHandler } from './application/commands/create-user.handler'
import { UpdateUserHandler } from './application/commands/update-user.handler'
import { DeactivateUserHandler } from './application/commands/deactivate-user.handler'
import { UsersController } from './http/users.controller'

@Module({
  imports: [CqrsModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
    ListUsersHandler,
    CreateUserHandler,
    UpdateUserHandler,
    DeactivateUserHandler,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
