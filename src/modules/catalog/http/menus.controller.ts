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
import { CreateMenuCommand } from '../application/commands/create-menu.command'
import { DeleteMenuCommand } from '../application/commands/delete-menu.command'
import { ToggleMenuActiveCommand } from '../application/commands/toggle-menu-active.command'
import { UpdateMenuCommand } from '../application/commands/update-menu.command'
import { ListMenusQuery } from '../application/queries/list-menus.query'
import { CreateMenuDto, UpdateMenuDto } from '../application/dtos/menu.dto'

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll() {
    return this.queryBus.execute(new ListMenusQuery())
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateMenuDto) {
    return this.commandBus.execute(new CreateMenuCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.commandBus.execute(new UpdateMenuCommand(id, dto))
  }

  @Patch(':id/active')
  @Roles(ROLE.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.commandBus.execute(new ToggleMenuActiveCommand(id))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteMenuCommand(id))
  }
}
