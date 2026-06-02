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
import { CreateAreaCommand } from '../application/commands/create-area.command'
import { DeleteAreaCommand } from '../application/commands/delete-area.command'
import { UpdateAreaCommand } from '../application/commands/update-area.command'
import { ListAreasQuery } from '../application/queries/list-areas.query'
import { CreateAreaDto, UpdateAreaDto } from '../application/dtos/area.dto'

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll() {
    return this.queryBus.execute(new ListAreasQuery())
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateAreaDto) {
    return this.commandBus.execute(new CreateAreaCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.commandBus.execute(new UpdateAreaCommand(id, dto))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteAreaCommand(id))
  }
}
