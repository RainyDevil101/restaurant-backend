import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { CreateUserCommand } from '../application/commands/create-user.command'
import { DeactivateUserCommand } from '../application/commands/deactivate-user.command'
import { UpdateUserCommand } from '../application/commands/update-user.command'
import { CreateUserDto } from '../application/dtos/create-user.dto'
import { UpdateUserDto } from '../application/dtos/update-user.dto'
import { ListUsersQuery } from '../application/queries/list-users.query'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles(ROLE.ADMIN)
  findAll() {
    return this.queryBus.execute(new ListUsersQuery())
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeactivateUserCommand(id))
  }
}
