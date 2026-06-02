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
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { CreateTableCommand } from '../application/commands/create-table.command'
import { DeleteTableCommand } from '../application/commands/delete-table.command'
import { UpdateTableCommand } from '../application/commands/update-table.command'
import { UpdateTableStatusCommand } from '../application/commands/update-table-status.command'
import { ListTablesQuery } from '../application/queries/list-tables.query'
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from '../application/dtos/table.dto'

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Query('areaId') areaId?: string) {
    return this.queryBus.execute(new ListTablesQuery(areaId))
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateTableDto) {
    return this.commandBus.execute(new CreateTableCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.commandBus.execute(new UpdateTableCommand(id, dto))
  }

  @Patch(':id/status')
  @Roles(ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTableStatusDto) {
    return this.commandBus.execute(new UpdateTableStatusCommand(id, dto.status))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteTableCommand(id))
  }
}
