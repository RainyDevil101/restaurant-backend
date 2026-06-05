import { Inject, Injectable } from '@nestjs/common'
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { USER_REPOSITORY, type IUserRepository } from '../../domain/ports/user.repository.port'
import type { UserDto } from '../dtos/user.dto'
import { ListUsersQuery } from './list-users.query'

@QueryHandler(ListUsersQuery)
@Injectable()
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.repo.findAll()
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      isOwner: user.isOwner,
    }))
  }
}
