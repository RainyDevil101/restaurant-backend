import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { CurrentUser } from '../../auth/infrastructure/decorators/current-user.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import type { TokenPayload } from '../../auth/domain/ports/token.service.port'
import { CancelOrderCommand } from '../application/commands/cancel-order.command'
import { CreateOrderCommand } from '../application/commands/create-order.command'
import { UpdateOrderStatusCommand } from '../application/commands/update-order-status.command'
import { GetOrdersByTableQuery } from '../application/queries/get-orders-by-table.query'
import { GetComandasQuery } from '../application/queries/get-comandas.query'
import { GetTableComandasQuery } from '../application/queries/get-table-comandas.query'
import { resolvePaperWidth } from '../../settings/domain/constants/paper-width.constants'
import { CancelOrderDto, CreateOrderDto, UpdateOrderStatusDto } from '../application/dtos/order.dto'

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Query('tableId') tableId?: string) {
    return this.queryBus.execute(new GetOrdersByTableQuery(tableId ?? ''))
  }

  @Get('table/:tableId/comandas')
  @Roles(ROLE.CAJERO, ROLE.ADMIN)
  tableComandas(@Param('tableId') tableId: string, @Query('width') width?: string) {
    return this.queryBus.execute(new GetTableComandasQuery(tableId, resolvePaperWidth(width)))
  }

  @Get('table/:tableId')
  findByTable(@Param('tableId') tableId: string) {
    return this.queryBus.execute(new GetOrdersByTableQuery(tableId))
  }

  @Get(':id/comandas')
  @Roles(ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN)
  comandas(@Param('id') id: string, @Query('width') width?: string) {
    return this.queryBus.execute(new GetComandasQuery(id, resolvePaperWidth(width)))
  }

  @Post()
  @Roles(ROLE.MESERO, ROLE.ADMIN)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: TokenPayload) {
    return this.commandBus.execute(new CreateOrderCommand(dto, user.sub))
  }

  @Patch(':id/status')
  @Roles(ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.commandBus.execute(new UpdateOrderStatusCommand(id, dto.status))
  }

  @Post(':id/cancel')
  @Roles(ROLE.CAJERO, ROLE.ADMIN)
  cancel(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.commandBus.execute(
      new CancelOrderCommand(id, dto.reason, dto.adminEmail, dto.adminCredential),
    )
  }
}
